
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  const statusElement = document.getElementById('status');
  statusElement.textContent = ''; // Clear the previous status message

  if (!file) {
    alert('Please select a file');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      statusElement.textContent = result.message;
      statusElement.style.color = 'green';
      fetchFiles(); // Refresh file list after a successful upload
    } else {
      throw new Error(result.message);
    }
  } catch (err) {
    console.error(err);
    statusElement.textContent = 'Upload failed!';
    statusElement.style.color = 'red';
  }
});




// fetching files
async function fetchFiles() {
  try {
    const response = await fetch('http://localhost:5000/files');
    const files = await response.json();

    const filesList = document.getElementById('files');
    filesList.innerHTML = '';

    files.forEach(file => {
      const listItem = document.createElement('li');
      // In your fetchFiles function, update the listItem.innerHTML to:
      listItem.innerHTML = `
        <span>${file.filename}</span>
         <div class="buttons">
            <input type="button" value="Download" onclick="downloadFile('${file.filename}')" class="download">
            <input type="button" value="Delete" onclick="deleteFile('${file._id}')" class="delete">
         </div>
      `;
      filesList.appendChild(listItem);
    });
  } catch (err) {
    console.error('Failed to fetch files:', err);
  }
}

// Delete file
async function deleteFile(fileId) {
  try {
    const response = await fetch(`http://localhost:5000/delete/${fileId}`, {
      method: 'DELETE',
    });
    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      fetchFiles(); // Refresh the file list after deletion
    } else {
      throw new Error(result.message);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
    alert('Failed to delete the file!');
  }
}

// Download file
async function downloadFile(filename) {
  try {
    const response = await fetch(`http://localhost:5000/download/${filename}`);
    if (!response.ok) {
      throw new Error('Download failed!');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error downloading file:', err);
  }
}

// Fetch files on page load
fetchFiles();















