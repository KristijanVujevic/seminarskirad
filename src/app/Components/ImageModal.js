import React from "react";
import Modal from "react-modal";

const customStyles = {
  content: {
    maxWidth: "80%", // Adjust the width of the modal content
    maxHeight: "80%", // Adjust the height of the modal content
    margin: "auto", // Center the modal
    border: "none", // Remove border
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add a subtle shadow
    borderRadius: "8px", // Add border radius
    overflow: "hidden", // Hide overflow
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add a semi-transparent overlay
  },
};

const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <Modal
      isOpen={!!imageUrl}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false} // This is needed to prevent a warning in some environments
    >
      <img
        src={imageUrl}
        alt="Full-size Image"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <button
        onClick={onClose}
        style={{ position: "absolute", top: "10px", right: "10px" }}
      >
        Close
      </button>
    </Modal>
  );
};

export default ImageModal;
