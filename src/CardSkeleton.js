import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function CardSkeleton() {
  return (
    <div className="vkw-card">
      <Skeleton height={getRandomInt(200, 400)} />
      <div className="vkw-card__caption"><Skeleton /></div>
    </div>
  )
}

export default CardSkeleton;