import React from 'react';
import LazyLoad from 'react-lazy-load';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function Card(props) {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="vkw-card">
      <LazyLoad>
        <>
          {!imageLoaded && <Skeleton baseColor="#FCDAE4" highlightColor="#FDEDF1" width={'100%'} height={getRandomInt(100, 300)} />}

          {/* Display image when loaded */}
          <img
            onLoad={handleImageLoad}
            className={`vkw-card__image ${imageLoaded ? 'loaded' : ''}`}
            alt="..."
            src={props.url}
          />
        </>
      </LazyLoad>

      {/* Display caption if available. Show skeleton until image is fully loaded */}
      {props.caption && (
        <div className="vkw-card__caption">
          {imageLoaded ? props.caption : <Skeleton baseColor="#FCDAE4" highlightColor="#FDEDF1" count={2} />}
        </div>
      )}
    </div>
  )
}

export default Card;