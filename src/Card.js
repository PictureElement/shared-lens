import React from 'react';
import './Card.scss';

function Card(props) {
  return (
    <div className="card">
      <img className="card__image" alt="..." src={props.url} />
      <div className="card__caption">{props.caption}</div>
    </div>
  )
}

export default Card;