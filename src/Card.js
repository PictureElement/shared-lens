import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function Card(props) {
  return (
    <div className="vkw-card">
      <img className="vkw-card__image" alt="..." src={props.url} />
      {props.caption && <div className="vkw-card__caption">{props.caption || <Skeleton />}</div>}
    </div>
  )
}

export default Card;