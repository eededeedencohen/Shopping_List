// import React from 'react';
// import PropTypes from 'prop-types';
// import { ReactMediaRecorder } from 'react-media-recorder';
// import RecordIcon from './RecordIcon';
// import './RecordMessage.css';

// const RecordMessage = ({ handleStop }) => {
//   return (
//     <div>
//       <ReactMediaRecorder
//         audio
//         onStop={handleStop}
//         render={({ status, startRecording, stopRecording }) => (
//           <div className="mt-2">
//             <button
//               onMouseDown={startRecording}
//               onMouseUp={stopRecording}
//               className="bg-white p-4 rounded-full shadow-lg"
//             >
//               <RecordIcon
//                 classText={
//                   status === "recording"
//                     ? "record-icon-recording"
//                     : "record-icon-idle"
//                 }
//               />
//             </button>
//             <p className="mt-2 text-white font-light">{status}</p>
//           </div>
//         )}
//       />
//     </div>
//   );
// };

// RecordMessage.propTypes = {
//   handleStop: PropTypes.func.isRequired,
// };

// export default RecordMessage;
