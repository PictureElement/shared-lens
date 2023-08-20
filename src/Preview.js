import React from 'react';
import './Preview.scss';

function Preview({ item, index, onCaptionChange }) {

  const handleChange = (e) => {
    const caption = e.target.value;
    onCaptionChange(index, caption);
  }

  return (
    <div className="preview">
      <img className="preview__image" src={URL.createObjectURL(item.file)} alt="Preview" />
      <input
        className="preview__input"
        type="text"
        value={item.caption}
        onChange={handleChange}
        placeholder="Enter caption"
      />
    </div>
  )
}

export default Preview;