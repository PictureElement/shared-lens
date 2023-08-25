import React from 'react';
import Card from './Card';
import Preview from './Preview';
import './App.scss';
import { storage } from './firebase';
import { ref, uploadBytes, list, getDownloadURL, getMetadata } from "firebase/storage";
import { v4 } from 'uuid';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry";
import { ReactComponent as AddPhotoIcon } from './icons/add-photo.svg';

function App() {
  // State initialization
  const [pendingUploads, setPendingUploads] = React.useState([]);
  const [galleryItems, setGalleryItems] = React.useState([]);

  // useEffect hook to retrieve and set images from Firebase on component mount
  React.useEffect(() => {
    // Create a reference to a specific location in Firebase Storage
    const listRef = ref(storage, '/');

    list(listRef, { maxResults: 100 })
      .then((res) => {
        const urlPromises = res.items.map((itemRef) => getDownloadURL(itemRef));
        const metadataPromises = res.items.map((itemRef) => getMetadata(itemRef));
        return Promise.all([Promise.all(urlPromises), Promise.all(metadataPromises)]);
      })
      // Download URLs and metadata fetched for all images
      .then(([urls, metadataArr]) => {
        const galleryObjects = urls.map((url, index) => ({
          url,
          caption: metadataArr[index].customMetadata.caption
        }));
        setGalleryItems(galleryObjects);
      })
      // Handle any fetch errors for URLs or metadata
      .catch((error) => {
        console.error(error);
      });
  }, []);
  
  // Handle file input changes
  const handleChange = (event) => {
    const newFiles = Array.from(event.target.files).map((file) => ({
      id: v4(),
      file,
      caption: ''
    }));
    setPendingUploads((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Update the caption of a specific pending upload
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

  // Remove a pending upload item from the state based on its itemId.
  const handlePreviewDelete = (itemId) => {
    // console.log('delete');
    setPendingUploads((prevItems) => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      return updatedItems;
    });
  };
  
  // Submit and upload image files to Firebase Storage
  const handleSubmit = (event) => {
    if (pendingUploads.length === 0) return;

    const uploadPromises = pendingUploads.map((item) => {
      // Create a reference
      const itemRef = ref(storage, v4());

      const metadata = {
        customMetadata: {
          caption: item.caption
        }
      };
      
      return uploadBytes(itemRef, item.file, metadata)
        .then((snapshot) => {
          console.log(`Uploaded ${item.file.name}!`);
          // Return the promise for getting the download URL
          return getDownloadURL(snapshot.ref);
        })
        .then((url) => {
          return {url: url, caption: item.caption}
        })
        .catch((error) => {
          console.error(error);
          return null; // Return null or some error indicator for failed uploads
        });
    });

    Promise.all(uploadPromises).then(results => {
      // Filter out null values (or other error indicators) if any
      const successfulUploads = results.filter(result => result !== null);
      // Update state
      setGalleryItems(prevItems => [...prevItems, ...successfulUploads]);
      setPendingUploads([]);
    });
  };











  const Cards = galleryItems.slice().reverse().map((item) => (
    <Card
      key={item.url}
      url={item.url}
      caption={item.caption}
    />
  ));

  const imagePreviews = pendingUploads.map((item) => (
    <Preview
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
          {/* <h1 className="vkw-hero__title">Vangelis & Katerina's<br />Collective Photo Album</h1> */}
          <h1 className="vkw-hero__title">Collective Photo Album</h1>
          <div className="vkw-dropzone">
            <label className="vkw-dropzone__label" htmlFor="photoUploadInput">
                Upload Your Photos:
                {pendingUploads.length > 0 && ` (${pendingUploads.length} file${pendingUploads.length > 1 ? 's' : ''} chosen)`}
            </label>
            <div className="vkw-dropzone__previews">
              <input
                onChange={handleChange}
                className="vkw-dropzone__input"
                id="photoUploadInput"
                type="file"
                accept=".png, .jpg, .jpeg"
                multiple
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
          </div>
          <button className="vkw-hero__submit" onClick={handleSubmit}>Submit</button>
        </div>
      </section>

      <section className="vkw-gallery">
        <div className="vkw-gallery__container">
          <ResponsiveMasonry columnsCountBreakPoints={{750: 2, 900: 3}}>
            <Masonry gutter="20px">
              {Cards}
            </Masonry>
          </ResponsiveMasonry>
        </div>
      </section>

      <div className="vkw-copyright">Web app by <a href="https://www.msof.me/" target="_blank">Marios Sofokleous</a></div>
    </>
  );
}

export default App;
