import React from 'react';

function Preview({ item, index, onCaptionChange }) {

  const handleChange = (e) => {
    const caption = e.target.value;
    onCaptionChange(index, caption);
  }

  return (
    <div className="vkw-preview">
      <img className="vkw-preview__image" src={URL.createObjectURL(item.file)} alt="Preview" />
      <input
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