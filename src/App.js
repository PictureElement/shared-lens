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
import { ThreeDots } from  'react-loader-spinner';
import BackToTopButton from './BackToTopButton';

const itemsPerPage = 24; // Set the number of items to display per page
// const itemsPerPage = 60; // Set the number of items to display per page

function App() {
  // State initialization
  const [allGalleryItems, setAllGalleryItems] = React.useState([]);
  const [paginatedGalleryItems, setPaginatedGalleryItems] = React.useState([]);
  const [pendingUploads, setPendingUploads] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [numOfItems, setNumOfItems] = React.useState(0);
  const [effectKey, setEffectKey] = React.useState(0);
  
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
      })
      // Handle any fetch errors for URLs or metadata
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

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
    
  // Handle file input changes
  const handleChange = (event) => {
    const newFiles = Array.from(event.target.files).map((file) => ({
      id: v4(),
      file,
      caption: ''
    }));
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

  // Handles deletion of a pending upload
  const handlePreviewDelete = (itemId) => {
    // console.log('delete');
    setPendingUploads((prevItems) => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      return updatedItems;
    });
  };

  // Resizes an image file and returns a Promise that resolves with the resized image as a Blob
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      if (file) {
        const img = new Image();
        const reader = new FileReader();
  
        reader.onload = function (e) {
          img.src = e.target.result;
  
          img.onload = function () {
            const canvas = document.createElement('canvas');
  
            const MAX_WIDTH = 1600;
            const MAX_HEIGHT = 1600;
            let width = img.width;
            let height = img.height;
  
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
  
            canvas.width = width;
            canvas.height = height;
  
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
  
            canvas.toBlob(function (blob) {
              resolve(blob);
            }, 'image/webp', 0.7);
          };
        };
  
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  // Submits and uploads image files to Firebase Storage
  const handleSubmit = (event) => {
    if (pendingUploads.length === 0) return;

    if (pendingUploads.length > 4) {
      alert('You can only upload a maximum of 4 files at a time.');
      return;
    }

    setLoading(true);

    const uploadPromises = pendingUploads.map(async (item) => {
      const resizedBlob = await resizeImage(item.file); // await for resizing to be done

      // Create a reference
      const itemRef = ref(storage, v4());

      const metadata = {
        customMetadata: {
          caption: item.caption
        }
      };
      
      // if resizedBlob is not null, upload it; else upload the original file
      const blobToUpload = resizedBlob || item.file;

      return uploadBytes(itemRef, blobToUpload, metadata)
        .then((snapshot) => {
          console.log(`Uploaded ${item.file.name}!`);
        })
        .catch((error) => {
          console.error(error);
          return null; // Return null or some error indicator for failed uploads
        });
    });

    Promise.all(uploadPromises).then(() => {  
      // Reset state
      setAllGalleryItems([]);
      setPaginatedGalleryItems([]);
      setLoading(false);
      setCurrentPage(1);
      setNumOfItems(0);
      setEffectKey(prev => prev + 1);
    });
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
      onPreviewDelete={handlePreviewDelete}
    />
  ));
  
  return (
    <>
      <section className="vkw-hero">
        <div className="vkw-hero__container">
          <h1 className="vkw-hero__title">Evangelos & Katerina<br />Collective Photo Album</h1>
          <div className="vkw-hero__subtitle">Capturing Love, Laughter,<br />and Cherished Moments</div>
        </div>
        <Flower />
      </section>

      <section className="vkw-dropzone">
        <div className="vkw-dropzone__container">
          <label className="vkw-dropzone__label" htmlFor="photoUploadInput">
            Upload Your Photos:
            {pendingUploads.length > 0 && ` (${pendingUploads.length} file${pendingUploads.length > 1 ? 's' : ''} chosen)`}
          </label>
          <div className="vkw-dropzone__previews">
            <input
              disabled={loading}
              onChange={handleChange}
              className="vkw-dropzone__input"
              id="photoUploadInput"
              type="file"
              accept=".png, .jpg, .jpeg"
              multiple
              max="4"
            />
            {
              pendingUploads.length === 0 
                ? (
                    <div className="vkw-dropzone__icon">
                      <AddPhotoIcon />
                      <div>Drop up to 4 files.</div>
                    </div>
                  ) 
                : null
            }
            { pendingUploads.length > 0 
              ? imagePreviews 
              : null 
            }
          </div>
          <button disabled={loading} className="vkw-hero__submit" onClick={handleSubmit}>
            {loading ? (
              <>
                <span className="vkw-hero__submit-spinner" role="status" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              <>
                Submit
              </>
            )}
          </button>
        </div>
      </section>

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
