import React from 'react';

function Card(props) {
  return (
    <div className="vkw-card">
      <img className="vkw-card__image" alt="..." src={props.url} />
      <div className="vkw-card__caption">{props.caption}</div>
    </div>
  )
}

export default Card;