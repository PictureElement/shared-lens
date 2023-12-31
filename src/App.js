import React from 'react';
import Card from './Card';
import Preview from './Preview';
import './App.scss';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { v4 } from 'uuid';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry";
import { ReactComponent as AddPhotoIcon } from './icons/add-photo.svg';
import Flower from './Flower';
import Pagination from './Pagination';
import { ThreeDots, RotatingLines } from  'react-loader-spinner';
import BackToTopButton from './BackToTopButton';

// Configuration
const heroTitle = process.env.REACT_APP_HERO_TITLE || "Welcome to <em>SharedLens</em><br />Your collective photo gallery";
const itemsPerPage = parseInt(process.env.REACT_APP_ITEMS_PER_PAGE, 10) || 60;
const maxImageSize = parseInt(process.env.REACT_APP_MAX_IMAGE_SIZE, 10) || 1600;
const blobType = process.env.REACT_APP_BLOB_TYPE || 'image/webp';
const blobQuality = parseFloat(process.env.REACT_APP_BLOB_QUALITY) || 0.8;
const maxFileSelection = parseInt(process.env.REACT_APP_MAX_FILE_SELECTION, 10) || 8;
const columnsBreakpoint1 = process.env.REACT_APP_COLUMNS_BREAKPOINT_1 || '0:2';
const columnsBreakpoint2 = process.env.REACT_APP_COLUMNS_BREAKPOINT_2 || '767:3';
const columnsBreakpoint3 = process.env.REACT_APP_COLUMNS_BREAKPOINT_3 || '1024:4';
const columnsCountBreakPoints = {
  [columnsBreakpoint1.split(':')[0]]: parseInt(columnsBreakpoint1.split(':')[1], 10),
  [columnsBreakpoint2.split(':')[0]]: parseInt(columnsBreakpoint2.split(':')[1], 10),
  [columnsBreakpoint3.split(':')[0]]: parseInt(columnsBreakpoint3.split(':')[1], 10)
};
const masonryGutter = process.env.REACT_APP_MASONRY_GUTTER || '20px';

// Comprehensive detection of the Facebook in-app browser
function isFacebookInAppBrowser() {
  const isUserAgentMatch = navigator.userAgent.match(/FBAN|FBAV/i);
  const isGlobalVariableDefined = typeof FB_IAB !== 'undefined';
  const isClassListContains = document.documentElement.classList.contains('in-app-browser');

  return isUserAgentMatch || isGlobalVariableDefined || isClassListContains;
}

function App() {
  // State initialization
  const [allGalleryItems, setAllGalleryItems] = React.useState([]);
  const [paginatedGalleryItems, setPaginatedGalleryItems] = React.useState([]);
  const [pendingUploads, setPendingUploads] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [resizing, setResizing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [numOfItems, setNumOfItems] = React.useState(0);
  const [effectKey, setEffectKey] = React.useState(0);
  const fileInputRef = React.useRef(null);
  
  // Fetches gallery items from Firebase Storage and sets up pagination
  const fetchGalleryItems = () => {
    setLoading(true);

    // Create a reference to a specific location in Firebase Storage
    const listRef = ref(storage, '/');

    listAll(listRef)
      .then((res) => {
        setNumOfItems(res.items.length);
        // Fetch download URLs and metadata for all images
        const urlPromises = res.items.map((itemRef) => getDownloadURL(itemRef));
        const metadataPromises = res.items.map((itemRef) => getMetadata(itemRef));
        return Promise.all([Promise.all(urlPromises), Promise.all(metadataPromises)]);
      })
      .then(([urls, metadataArr]) => {
        // Process the fetched data and set the state
        let allGalleryObjects = urls.map((url, index) => {
          const customMetadata = metadataArr[index]?.customMetadata;
          const caption = customMetadata?.caption || null;
          return {
            url,
            caption,
            timeCreated: metadataArr[index]?.timeCreated || null
          };
        });

        // Sort all items in reverse chronological order
        allGalleryObjects = allGalleryObjects.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));

        // Paginate the fetched items to display a specific number of items per page
        const paginatedGalleryObjects = allGalleryObjects.slice(0, itemsPerPage);

        setAllGalleryItems([...allGalleryObjects]);
        setPaginatedGalleryItems([...paginatedGalleryObjects]);

        setPendingUploads([]);
        setLoading(false);
        setSubmitting(false);
      })
      // Handle any fetch errors for URLs or metadata
      .catch((error) => {
        alert('Error code: 1');
        setLoading(false);
      });
  };

  // Detect Facebook in-app browser on the first render
  React.useEffect(() => {
    const isUsingFacebookInAppBrowser = isFacebookInAppBrowser();
  
    if (isUsingFacebookInAppBrowser) {
      alert('You are currently using the Facebook in-app browser, which may not provide the best experience. For optimal performance, please open this app in Chrome, Firefox, Safari, or Opera.')
    }
  }, []);

  // Fetches gallery items on component mount or whenever effectKey changes
  React.useEffect(() => {
    fetchGalleryItems();
  }, [effectKey]);

  // Handles a change in the selected page for pagination
  const handlePageChange = (page) => {
    setLoading(true);
    setCurrentPage(page);

    // Start and end index
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Update the paginated items based on the new range
    const newPaginatedGalleryItems = allGalleryItems.slice(startIndex, endIndex);

    // Set the updated paginated items
    setPaginatedGalleryItems(newPaginatedGalleryItems);

    setLoading(false);
  }
    
  // Handle file input changes.
  // Resize the images before adding them to pending uploads
  const handleChange = async (event) => {
    setResizing(true);

    const currentSlots = pendingUploads.length;
    const remainingSlots = maxFileSelection - currentSlots;

    const selectedFiles = Array.from(event.target.files).slice(0, remainingSlots);

    const newFiles = await Promise.all(selectedFiles.map(async (file) => {
      const resizedBlob = await resizeImage(file); // Resize the image
      return {
        id: v4(),
        file: resizedBlob || file, // Use the resized image if available, else use the original
        caption: ''
      };
    }));
    setResizing(false);
    setPendingUploads((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Handles caption changes for a specific pending upload
  const handleCaptionChange = (itemId, newCaption) => {
    setPendingUploads((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.id === itemId) {
          return {...item, caption: newCaption};
        }
        return item;
      });
      
      return updatedItems;
    });
  };

  // Handles deletion of all pending uploads
  const handleClearPendingUploads = (itemId) => {
    // Clear the file input values to allow re-drop of files
    fileInputRef.current.value = null;
    // Clear state
    setPendingUploads([]);
  };

  // Resizes an image file and returns a Promise that resolves with the resized image as a Blob
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
          
        const img = new Image();

        img.onload = function() {
          const pica = require('pica')();

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxImageSize) {
              height *= maxImageSize / width;
              width = maxImageSize;
            }
          } else {
            if (height > maxImageSize) {
              width *= maxImageSize / height;
              height = maxImageSize;
            }
          }

          const offscreenCanvas = new OffscreenCanvas(width, height);

          // Resize & convert to blob
          pica.resize(img, offscreenCanvas)
            .then(result => pica.toBlob(result, blobType, blobQuality))
            .then(blob => resolve(blob))
            .catch(error => reject(error));
        }

        img.src = e.target.result;
      }

      reader.readAsDataURL(file);
    });
  };

  // Submits and uploads image files to Firebase Storage
  const handleSubmit = async (event) => {
    if (pendingUploads.length === 0) return;

    let uploadsToProcess = [...pendingUploads];  // Create a copy of the pending uploads
    if (uploadsToProcess.length > maxFileSelection) {
      uploadsToProcess = uploadsToProcess.slice(0, maxFileSelection);  // Keep only the first maxFileSelection elements
    }

    setLoading(true);
    setSubmitting(true);

    const uploadPromises = uploadsToProcess.map(async (item) => {
      // Create a reference
      const itemRef = ref(storage, v4());

      const metadata = {
        customMetadata: {
          caption: item.caption
        }
      };
      
      return uploadBytes(itemRef, item.file, metadata)
        .then((snapshot) => {
          // console.log(`Uploaded ${item.file.name}!`);
        })
        .catch((error) => {
          alert('Error code: 2');
          return null; // Return null or some error indicator for failed uploads
        });
    });

    await Promise.all(uploadPromises);
    
    // Reset state
    setAllGalleryItems([]);
    setPaginatedGalleryItems([]);
    setLoading(false);
    setCurrentPage(1);
    setNumOfItems(0);
    setEffectKey(prev => prev + 1);
  };

  const Cards = paginatedGalleryItems.map((item) => (
    <Card
      key={item.url}
      url={item.url}
      caption={item.caption}
      loading={loading}
    />
  ));

  const imagePreviews = pendingUploads.map((item) => (
    <Preview
      loading={loading}
      key={item.id}
      item={item}
      onCaptionChange={handleCaptionChange}
    />
  ));
  
  return (
    <>
      <section className="sl-hero">
        <div className="sl-hero__container">
          <h1 className="sl-hero__title" dangerouslySetInnerHTML={{ __html: heroTitle }}></h1>
          <div className="sl-dropzone">
            <label className="sl-dropzone__label" htmlFor="photoUploadInput">
              {pendingUploads.length < maxFileSelection
                ? "Select your photos:"
                : <span style={{color:"#dc3545"}}>You've hit the {maxFileSelection}-file selection limit.</span>}
            </label>
            <div className="sl-dropzone__area">
              <input
                title=""
                multiple
                ref={fileInputRef}
                disabled={loading || pendingUploads.length >= maxFileSelection || resizing}
                onChange={handleChange}
                className="sl-dropzone__input"
                id="photoUploadInput"
                type="file"
                accept=".png, .jpg, .jpeg, .webp"
              />
              <div className="sl-dropzone__icon">
                {resizing ? (
                  <RotatingLines
                    strokeColor="#F26D91"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="48"
                    visible={true}
                  />
                ) : (
                  <AddPhotoIcon />
                )}
                <div>Drop up to {maxFileSelection} files.</div>
              </div>
            </div>
          </div>
        </div>
        <Flower />
      </section>

      {pendingUploads.length > 0 && (
        <div className="sl-previews">
          <div className="sl-previews__container">
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"}}>
              <h2 className="sl-previews__title">{pendingUploads.length > 0 && `${pendingUploads.length > maxFileSelection ? maxFileSelection : pendingUploads.length} file${pendingUploads.length > 1 ? 's' : ''} chosen`}</h2>
              <button disabled={loading} onClick={handleClearPendingUploads} className="sl-previews__clear">Clear all</button>
            </div>
            <div className="sl-previews__grid">
              {imagePreviews}
            </div>
            <button disabled={loading} className="sl-hero__submit" onClick={handleSubmit}>
              {submitting ? (
                <>
                  <span className="sl-hero__submit-spinner" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                <>
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? null : (
        <Pagination
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          numOfItems={numOfItems}
          onPageChange={handlePageChange}
        />
      )}
      
      <section className="sl-gallery">
        <div className="sl-gallery__container">
          <ThreeDots 
            height="80" 
            width="80" 
            radius="9"
            color="#F26D91" 
            ariaLabel="loading images"
            wrapperStyle={{justifyContent: 'center'}}
            visible={loading}
          />
          {loading ? null : (
            <ResponsiveMasonry columnsCountBreakPoints={columnsCountBreakPoints}>
              <Masonry gutter={masonryGutter}>
                {Cards}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </div>
      </section>

      <div className="sl-copyright">Web app by <a href="https://www.msof.me/" rel="noreferrer" target="_blank">Marios Sofokleous</a></div>

      <BackToTopButton />
    </>
  );
}

export default App;
