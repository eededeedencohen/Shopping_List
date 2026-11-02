import React, { useState } from "react";
import Modal from "../Modal";
import SupermarketsNames from "./SupermarketsNames";
import SupermarketsBranches from "./SupermarketsBranches";

const ReplaceSupermarket = ({ isOpen, closeModal, onSelectBranch, ignoreCart = false }) => {
  const [selectedSupermarket, setSelectedSupermarket] = useState(null);

  const handleClose = () => {
    setSelectedSupermarket(null);
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {!selectedSupermarket ? (
        <SupermarketsNames onSelectSupermarket={setSelectedSupermarket} ignoreCart={ignoreCart} />
      ) : (
        <SupermarketsBranches
          selectedSupermarket={selectedSupermarket}
          onSelectBranch={onSelectBranch}
          onBack={() => setSelectedSupermarket(null)}
        />
      )}
    </Modal>
  );
};

export default ReplaceSupermarket;
