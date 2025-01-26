import React from "react";

const NoSelectComponent: React.FC = () => {
  return (
    <div className="select-none">
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Unselectable Content</h1>
        <p className="mb-4">
          This text cannot be selected. Tailwind's `select-none` class ensures this.
        </p>
        <img
          src="https://via.placeholder.com/300"
          alt="Example"
          className="pointer-events-none rounded-lg"
        />
      </div>
    </div>
  );
};

export default NoSelectComponent;
