import React from 'react';

function Card(props) {
  return (
    <div className="card">
      <img className="card__image" alt="..." src={props.url} />
      <div className="card__caption">Witnessed a beautiful union today. Love and happiness to Vangelis and Katerina!</div>
    </div>
  )
}

export default Card;