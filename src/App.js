import React from 'react';
import Card from './Card';
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
    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        const promises = res.items.map((itemRef) => getMetadata(itemRef));
  
        // Fetch the metadata for each item
        return Promise.all(promises)
          .then((metadataArr) => {
            // Sort the items by creation time in descending order
            const sortedItems = res.items.sort((a, b) => {
              const timeA = metadataArr.find(meta => meta.fullPath === a.fullPath).timeCreated;
              const timeB = metadataArr.find(meta => meta.fullPath === b.fullPath).timeCreated;
              return new Date(timeB) - new Date(timeA);
            });
  
            // Return the sorted items for further processing
            return sortedItems;
          });
      })
      .then((sortedItems) => {
        // Fetch the download URLs for the sorted items
        const urlPromises = sortedItems.map((itemRef) => getDownloadURL(itemRef));
  
        return Promise.all(urlPromises);
      })
      .then((urls) => {
        // Set the image URLs in state
        setimageUrls(urls);
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
      });
  }, []);  

  const handleChange = (event) => {
    setImageFiles(Array.from(event.target.files));
  }

  const handleClick = (event) => {
    if (imageFiles.length === 0) return;

    imageFiles.forEach((imageFile) => {
      // Create a reference to the image
      const imageRef = ref(storage, `${imageFile.name + v4()}`);

      // 'file' comes from the Blob or File API
      uploadBytes(imageRef, imageFile).then((snapshot) => {

        console.log(`Uploaded ${imageFile.name}!`);
        
        // Download uploaded image url and update state
        getDownloadURL(snapshot.ref)
          .then((url) => {
            setimageUrls((prevUrls) => [url, ...prevUrls]);
          });
      });
    });
  }

  const Cards = imageUrls.map((url, index) => (
    <Card
      url={url}
      key={index}
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
          <button className="submit" onClick={handleClick}>Submit</button>
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
