document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

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
    document.getElementById('status').textContent = result.message;
  } catch (err) {
    console.error(err);
    document.getElementById('status').textContent = 'Upload failed!';
  }
});

async function fetchFiles() {
  try {
    const response = await fetch('http://localhost:5000/files');
    const files = await response.json();

    const filesList = document.getElementById('files');
    filesList.innerHTML = '';

    files.forEach(file => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        ${file.filename} 
        <button onclick="downloadFile('${file.filename}')">Download</button>
        <button class="delete" onclick="deleteFile('${file._id}')">Delete</button>
      `;
      filesList.appendChild(listItem);
    });
  } catch (err) {
    console.error('Failed to fetch files:', err);
  }
}

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
