import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: Props) {
  return <>{children}</>;
}

