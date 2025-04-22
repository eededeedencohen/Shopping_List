// import React from "react";
// import "./MesageItemLoadingAI.css";

// const MesageItemLoadingAI = ({ message }) => {
//   return (
//     <div className={`message-item loading`}>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default MesageItemLoadingAI;

import React from "react";
import "./MesageItemLoadingAI.css";

const MesageItemLoadingAI = ({ message }) => {
  return (
    <div className="message-item loading">
      {/* הטקסט שיגיע כ-props */}
      <p>{message}</p>

      {/* אנימציית הטעינה */}
      <div className="loader"></div>
    </div>
  );
};

export default MesageItemLoadingAI;