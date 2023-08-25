import React from 'react';
import { ReactComponent as CloseIcon } from './icons/close.svg';

function Preview({ item, onCaptionChange, onPreviewDelete }) {

  const handleChange = (e) => {
    const caption = e.target.value;

    console.log(item.id);
    console.log(caption);

    onCaptionChange(item.id, caption);
  }

  const handleClick = (e) => {
    onPreviewDelete(item.id);
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
      <button onClick={handleClick} className="vkw-preview__delete"><CloseIcon /></button>
    </div>
  )
}

export default Preview;