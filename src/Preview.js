import React from 'react';

function Preview({ loading, item, onCaptionChange }) {

  const handleChange = (e) => {
    const caption = e.target.value;
    onCaptionChange(item.id, caption);
  }

  return (
    <div className="sl-preview">
      <img className="sl-preview__image" src={URL.createObjectURL(item.file)} alt="Preview" />
      <input
        disabled={loading}
        className="sl-preview__input"
        type="text"
        value={item.caption}
        onChange={handleChange}
        placeholder="Enter caption"
      />
    </div>
  )
}

export default Preview;
