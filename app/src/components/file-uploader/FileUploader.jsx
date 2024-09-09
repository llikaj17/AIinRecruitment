import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Box } from '@mui/material';
import Iconify from 'src/components/iconify';

// Reference: https://uploadcare.com/blog/how-to-upload-file-in-react/
const Result = ({ status }) => {
   if (status === "success") {
      return <p>✅ File uploaded successfully!</p>;
   } else if (status === "fail") {
      return <p>❌ File upload failed!</p>;
   } else if (status === "uploading") {
      return <p>⏳ Uploading selected file...</p>;
   } else {
      return null;
   }
};
Result.propTypes = {
   status: PropTypes.string
 };
 
const FileUploader = ({onFilesSelected, mode, onFileContentSet}) => {
   // Reference: https://uploadcare.com/blog/how-to-upload-file-in-react/

   const [file, setFile] = useState(null);
   const [status, setStatus] = useState('initial');

   const handleFileChange = (e) => {
      if (e.target.files) {
         setStatus('initial');
         setFile(e.target.files[0]);
      }
   };

   const handleRemoveFile = () => {
      setFile(null); 
   };

   const handleDrop = (event) => {
      event.preventDefault();
      const droppedFiles = event.dataTransfer.files;
      if (droppedFiles.length > 0) {
        setFile(droppedFiles[0]);
      }
   };

   const handleUpload = async () => {
      if (!file) {
         setStatus('fail');
         return;
      }

      // if we want to submit via a backend api to parse the data
      /**\/
      const formData = new FormData();
      formData.append('file', file);
      const result = await fetch('https://httpbin.org/post', {
         method: 'POST',
         body: formData,
      });
      const data = await result.json();
      console.log(data);
      /*/


      setStatus('uploading');
      const reader = new FileReader();
      reader.onabort = () => {
         console.log('file reading was aborted');
         setStatus('fail');
      }
      reader.onerror = () => {
         console.log('file reading has failed');
         setStatus('fail');
      }
      reader.onload = () => {
         const binaryStr = reader.result;
         const textualContent = new TextDecoder().decode(binaryStr);
         // TODO: Parse pdfs
         onFileContentSet(textualContent)
      }

      await reader.readAsArrayBuffer(file);

      setStatus('success');
   };

   useEffect(() => {
      onFilesSelected(file);
   }, [file, onFilesSelected]);

   return (
      <div className="drag-drop">
         <div
         className={`document-uploader ${ file ? "upload-box active" : "upload-box" }`}
         onDrop={handleDrop}
         onDragOver={(event) => event.preventDefault()}
         >
            <Box className="input-group" sx={{height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
               <Iconify icon="humbleicons:upload" color={'lightblue'} width={200} /> 
               <label style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', color: 'lightblue' }} htmlFor="browse">
                  Drag and Drop
               </label>
               <input hidden type="file" id="browse" onChange={handleFileChange} accept='application/pdf,application/txt,application/json'/>
               <label style={{ padding: '15x', backgroundColor: 'lightblue', width: '200px' }} htmlFor="browse" className="browse-btn">
                  Select
               </label>
            </Box>

            {file && (
               <section style={{color: '#fff'}}>
                  File details:
                  <ul>
                     <li>Name: {file.name}</li>
                     <li>Type: {file.type}</li>
                     <li>Size: {file.size} bytes</li>
                  </ul>
                  <Button onClick={handleUpload} className="submit" variant="outlined" fullWidth>
                     Upload
                  </Button>
               </section>
               
            )}

            <Result status={status} />
         </div>
      </div>
   );
};
export default FileUploader;

FileUploader.propTypes = {
   onFilesSelected: PropTypes.func,
   onFileContentSet: PropTypes.func,
   mode: PropTypes.string
};