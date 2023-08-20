import React from 'react';
import Card from './Card';
import Preview from './Preview';
import './App.scss';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { v4 } from 'uuid';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

function App() {
  const [imageFiles, setImageFiles] = React.useState([]);
  const [imageUrls, setimageUrls] = React.useState([]);

  // Create a reference under which you want to list
  const listRef = ref(storage, '/');

  React.useEffect(() => {
    listAll(listRef)
      .then((res) => {
        const promises = res.items.map((itemRef) => getMetadata(itemRef));
  
        return Promise.all(promises)
          .then((metadataArr) => {
            const sortedItems = res.items.sort((a, b) => {
              const timeA = metadataArr.find(meta => meta.fullPath === a.fullPath).timeCreated;
              const timeB = metadataArr.find(meta => meta.fullPath === b.fullPath).timeCreated;
              return new Date(timeB) - new Date(timeA);
            });
  
            return sortedItems;
          });
      })
      .then((sortedItems) => {
        const urlPromises = sortedItems.map((itemRef) => getDownloadURL(itemRef));
        const metadataPromises = sortedItems.map((itemRef) => getMetadata(itemRef));
  
        return Promise.all([Promise.all(urlPromises), Promise.all(metadataPromises)]);
      })
      .then(([urls, metadataArr]) => {
        const imageObjects = urls.map((url, index) => ({
          url,
          caption: metadataArr[index].customMetadata.caption
        }));
        setimageUrls(imageObjects);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  
  const handleChange = (event) => {
    const newFiles = Array.from(event.target.files).map((file) => ({
      file,
      caption: ''
    }));
    setImageFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleCaptionChange = (index, caption) => {
    setImageFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles[index].caption = caption;
      return updatedFiles;
    });
  };
  
  const handleSubmit = (event) => {
    if (imageFiles.length === 0) return;

    imageFiles.forEach((imageFile) => {
      // Create a reference to the image
      const imageRef = ref(storage, `${imageFile.name + v4()}`);

      const metadata = {
        customMetadata: {
          caption: imageFile.caption
        }
      };

      // 'file' comes from the Blob or File API
      uploadBytes(imageRef, imageFile.file, metadata).then((snapshot) => {

        console.log(`Uploaded ${imageFile.name}!`);
        
        // Download uploaded image url and update state
        getDownloadURL(snapshot.ref)
          .then((url) => {
            setimageUrls((prevUrls) => [url, ...prevUrls]);
          });
      });
    });
  }

  const Cards = imageUrls.map((image, index) => (
    <Card
      key={index}
      url={image.url}
      caption={image.caption}
    />
  ));

  const imagePreviews = imageFiles.map((item, index) => (
    <Preview
      key={index}
      item={item}
      index={index}
      onCaptionChange={handleCaptionChange}
    />
  ));
  
  return (
    <div id="vkw">
      <section className="hero-section">
        <div className="hero-section__container">
          <h1 className="hero-section__title">Vangelis & Katerina's<br />Wedding Journey</h1>
          <div className="form-control">
            <label className="form-control__label" htmlFor="image">Upload Your Photos:</label>
            <input onChange={handleChange} className="form-control__input" id="image" type="file" accept=".png, .jpg, .jpeg" multiple></input>
          </div>
          <div className="hero-section__previews">
            {imagePreviews}
          </div>
          <button className="submit" onClick={handleSubmit}>Submit</button>
        </div>
      </section>
      <section className="gallery-section">
        <div className="gallery-section__container">
          <ResponsiveMasonry columnsCountBreakPoints={{750: 2, 900: 3}}>
            <Masonry gutter="24px">
              {Cards}
            </Masonry>
          </ResponsiveMasonry>
        </div>
      </section>
      <div className="copyright">Web app by <a href="https://www.msof.me/" target="_blank">Marios Sofokleous</a></div>
    </div>
  );
}

export default App;
