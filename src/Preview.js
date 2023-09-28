import React from 'react';

function Preview({ loading, item, onCaptionChange }) {

  console.log("rendered");

  const handleChange = (e) => {
    const caption = e.target.value;

    console.log(item.id);
    console.log(caption);

    onCaptionChange(item.id, caption);
  }

  return (
    <div className="vkw-preview">
      <img className="vkw-preview__image" src={URL.createObjectURL(item.file)} alt="Preview" />
      <input
        disabled={loading}
        className="vkw-preview__input"
        type="text"
        value={item.caption}
        onChange={handleChange}
        placeholder="Enter caption"
      />
    </div>
  )
}

export default Preview;

/*
import React from 'react';

const Preview = React.memo(({ loading, item, onCaptionChange }) => {
  console.log("rendered");

  const handleChange = (e) => {
    const caption = e.target.value;
    onCaptionChange(item.id, caption);
  }

  return (
    <div className="vkw-preview">
      <img className="vkw-preview__image" src={URL.createObjectURL(item.file)} alt="Preview" />
      <input
        disabled={loading}
        className="vkw-preview__input"
        type="text"
        value={item.caption}
        onChange={handleChange}
        placeholder="Enter caption"
      />
    </div>
  );
});

export default Preview;
*/