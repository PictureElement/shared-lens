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

const itemsPerPage = 60; // Set the number of items to display per page

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
    const newFiles = await Promise.all(Array.from(event.target.files).map(async (file) => {
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
      if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const srcBlob = new Blob([file], { type: file.type });
          const reduce = require('image-blob-reduce')();
          reduce
            .toBlob(srcBlob, { max: 1600 })
            .then(blob => resolve(blob))
            .catch(error => reject(error));
        }

        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  // Submits and uploads image files to Firebase Storage
  const handleSubmit = async (event) => {
    if (pendingUploads.length === 0) return;

    let uploadsToProcess = [...pendingUploads];  // Create a copy of the pending uploads
    if (uploadsToProcess.length > 4) {
      uploadsToProcess = uploadsToProcess.slice(0, 4);  // Keep only the first 4 elements
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
      <section className="vkw-hero">
        <div className="vkw-hero__container">
          <h1 className="vkw-hero__title">Evangelos & Katerina's<br />collective photo album</h1>
          <div className="vkw-dropzone">
            <label className="vkw-dropzone__label" htmlFor="photoUploadInput">
              {pendingUploads.length < 4
                ? "Select your photos:"
                : <span style={{color:"#dc3545"}}>You've hit the 4-file selection limit.</span>}
            </label>
            <div className="vkw-dropzone__area">
              <input
                title=""
                multiple
                ref={fileInputRef}
                disabled={loading || pendingUploads.length >= 4 || resizing}
                onChange={handleChange}
                className="vkw-dropzone__input"
                id="photoUploadInput"
                type="file"
                accept=".png, .jpg, .jpeg"
              />
              <div className="vkw-dropzone__icon">
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
                <div>Drop up to 4 files.</div>
              </div>
            </div>
          </div>
        </div>
        <Flower />
      </section>

      {pendingUploads.length > 0 && (
        <div className="vkw-previews">
          <div className="vkw-previews__container">
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"}}>
              <h2 className="vkw-previews__title">{pendingUploads.length > 0 && `${pendingUploads.length > 4 ? '4' : pendingUploads.length} file${pendingUploads.length > 1 ? 's' : ''} chosen`}</h2>
              <button disabled={loading} onClick={handleClearPendingUploads} className="vkw-previews__clear">Clear all</button>
            </div>
            <div className="vkw-previews__grid">
              {imagePreviews}
            </div>
            <button disabled={loading} className="vkw-hero__submit" onClick={handleSubmit}>
              {submitting ? (
                <>
                  <span className="vkw-hero__submit-spinner" role="status" aria-hidden="true"></span>
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
      
      <section className="vkw-gallery">
        <div className="vkw-gallery__container">
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
            <ResponsiveMasonry columnsCountBreakPoints={{ 320: 2, 767: 3, 1024: 4 }}>
              <Masonry gutter="20px">
                {Cards}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </div>
      </section>

      <div className="vkw-copyright">Web app by <a href="https://www.msof.me/" rel="noreferrer" target="_blank">Marios Sofokleous</a></div>

      <BackToTopButton />
    </>
  );
}

export default App;
