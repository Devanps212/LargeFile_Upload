import { Formik, Field, ErrorMessage, Form } from 'formik';
import * as yup from 'yup';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const initialValues = {
    name: '',
    media: []
  };

  const dataSchema = yup.object({
    name: yup.string().required('Enter a valid Name'),
    media: yup.array()
      .of(
        yup.mixed()
          .required('A file is required')
          .test('fileSize', 'File too large', value => {
            return value && value.size <= 50 * 1024 * 1024;
          })
          .test('fileType', 'Unsupported file format', value => {
            return value && ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'].includes(value.type);
          })
      )
      .required('At least one file is required')
  });

  const uploadFilesInChunks = async (files) => {
    const chunkSize = 5 * 1024 * 1024;
    const url = 'http://localhost:3000/sendData';

    for (const file of files) {
      const totalChunks = Math.ceil(file.size / chunkSize);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const blob = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', blob, file.name);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('filename', file.name);

        await axios.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (values.media.length > 0) {
        await uploadFilesInChunks(values.media);
        setData({ message: 'Files uploaded successfully' });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setData({ message: 'Error uploading files' });
      setShowModal(true);
    } finally {
      resetForm();
    }
  };

  return (
    <div className='container-fluid'>
      <div className='content'>
        <div className='content-body vh-100 d-flex justify-content-center align-items-center'>
          <div className='formData bg-dark p-5 rounded'>
            <Formik
              initialValues={initialValues}
              validationSchema={dataSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue }) => (
                <Form>
                  <div className='mb-3'>
                    <h4 className='text-white text-center'>Submit Data</h4>
                    <label htmlFor='name' className='form-label text-white'>Name:</label>
                    <Field type='text' id='name' name='name' className='form-control' />
                    <ErrorMessage name='name' component='div' className='text-danger' />
                  </div>

                  <div className='mb-3'>
                    <label htmlFor='media' className='form-label text-white'>Media:</label>
                    <input
                      type='file'
                      id='media'
                      name='media'
                      className='form-control'
                      multiple
                      onChange={(event) => {
                        setFieldValue('media', Array.from(event.currentTarget.files));
                      }}
                    />
                    <ErrorMessage name='media' component='div' className='text-danger' />
                  </div>

                  <button type='submit' className='btn btn-primary'>Submit</button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data ? <p>{data.message}</p> : <p>No data available.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
