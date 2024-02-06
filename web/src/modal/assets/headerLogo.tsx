import React from 'react';

export default function HeaderLogo({
  h = 22,
  url
}: {
  h?: number;
  url?: string;
}) {
  return (
    <img src={url} style={{height:`${h}px`, width:'auto'}}/>
  );
}
