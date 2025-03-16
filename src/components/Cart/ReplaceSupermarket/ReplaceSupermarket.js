// import React, { useState } from "react";
// import Modal from "../Modal";
// import SupermarketsNames from "./SupermarketsNames";
// import SupermarketsBranches from "./SupermarketsBranches";

// const ReplaceSupermarket = ({ isOpen, closeModal, onSelectBranch }) => {
//   const [selectedSupermarket, setSelectedSupermarket] = useState(null);

//   return (
//     <Modal isOpen={isOpen} onClose={closeModal}>
//       {!selectedSupermarket ? (
//         <SupermarketsNames onSelectSupermarket={setSelectedSupermarket} />
//       ) : (
//         <SupermarketsBranches
//           selectedSupermarket={selectedSupermarket}
//           onSelectBranch={onSelectBranch}
//         />
//       )}
//     </Modal>
//   );
// };

// export default ReplaceSupermarket;

import React, { useState } from "react";
import Modal from "../Modal";
import SupermarketsNames from "./SupermarketsNames";
import SupermarketsBranches from "./SupermarketsBranches";

const ReplaceSupermarket = ({ isOpen, closeModal, onSelectBranch }) => {
  const [selectedSupermarket, setSelectedSupermarket] = useState(null);

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      {!selectedSupermarket ? (
        <SupermarketsNames onSelectSupermarket={setSelectedSupermarket} />
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
