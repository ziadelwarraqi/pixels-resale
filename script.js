let properties = JSON.parse(localStorage.getItem("properties")) || [];
let imageFiles = [];
let pdfFiles = [];
let currentDeleteIndex = null;
let currentEditIndex = null;

document.addEventListener("DOMContentLoaded", function() {
    displayProperties();
    togglePaymentFields();
    
    // Initialize file input event listeners
    document.getElementById('imageAttachments').addEventListener('change', handleImageUpload);
    document.getElementById('pdfAttachments').addEventListener('change', handlePDFUpload);
});

function formatNumber(input) {
    input.value = input.value.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function togglePaymentFields() {
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    const installmentFields = document.getElementById('installmentFields');
    
    if (paymentType === 'cash') {
        installmentFields.style.display = 'none';
        document.getElementById('downPayment').required = false;
        document.getElementById('monthlyInstallment').required = false;
        document.getElementById('installmentYears').required = false;
        document.getElementById('overPrice').required = false;
    } else {
        installmentFields.style.display = 'block';
        document.getElementById('downPayment').required = true;
        document.getElementById('monthlyInstallment').required = true;
        document.getElementById('installmentYears').required = true;
        document.getElementById('overPrice').required = true;
    }
}

function toggleEditPaymentFields() {
    const paymentType = document.querySelector('input[name="editPaymentType"]:checked').value;
    const installmentFields = document.getElementById('editInstallmentFields');
    
    if (paymentType === 'cash') {
        installmentFields.style.display = 'none';
        document.getElementById('editDownPayment').required = false;
        document.getElementById('editMonthlyInstallment').required = false;
        document.getElementById('editInstallmentYears').required = false;
        document.getElementById('editOverPrice').required = false;
    } else {
        installmentFields.style.display = 'block';
        document.getElementById('editDownPayment').required = true;
        document.getElementById('editMonthlyInstallment').required = true;
        document.getElementById('editInstallmentYears').required = true;
        document.getElementById('editOverPrice').required = true;
    }
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    imageFiles = [...imageFiles, ...files];
    updateImagePreview();
    e.target.value = ''; // Reset input to allow selecting same files again
}

function handlePDFUpload(e) {
    const files = Array.from(e.target.files);
    pdfFiles = [...pdfFiles, ...files];
    updatePDFPreview();
    e.target.value = ''; // Reset input to allow selecting same files again
}

function updateImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';
            
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="remove-btn" onclick="removeImage(${index})">×</button>
            `;
            
            previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

function updatePDFPreview() {
    const previewContainer = document.getElementById('pdfPreview');
    previewContainer.innerHTML = '';
    
    pdfFiles.forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'pdf-item';
        
        previewItem.innerHTML = `
            <div class="pdf-icon">📄</div>
            <div>
                <div style="font-weight:500;">${file.name}</div>
                <div style="font-size:0.8rem;color:var(--gray);">${(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button class="remove-btn" onclick="removePDF(${index})" style="margin-left:auto;">×</button>
        `;
        
        previewContainer.appendChild(previewItem);
    });
}

function removeImage(index) {
    imageFiles.splice(index, 1);
    updateImagePreview();
}

function removePDF(index) {
    pdfFiles.splice(index, 1);
    updatePDFPreview();
}

function addProperty() {
    const ownerName = document.getElementById('ownerName').value.trim();
    const ownerNumber = document.getElementById('ownerNumber').value.trim();
    const propertyType = document.getElementById('propertyType').value;
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    const totalPrice = document.getElementById('totalPrice').value;
    
    let downPayment = '';
    let monthlyInstallment = '';
    let installmentYears = '';
    let overPrice = '';
    
    if (paymentType === 'installment') {
        downPayment = document.getElementById('downPayment').value;
        monthlyInstallment = document.getElementById('monthlyInstallment').value;
        installmentYears = document.getElementById('installmentYears').value;
        overPrice = document.getElementById('overPrice').value;
    }
    
    // Validate required fields
    if (!ownerName || !ownerNumber || !propertyType || !totalPrice) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (paymentType === 'installment' && (!downPayment || !monthlyInstallment || !overPrice)) {
        alert('Please fill in all installment details');
        return;
    }

    const images = imageFiles.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
    }));
    
    const pdfs = pdfFiles.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
    }));

    const newProperty = {
        id: Date.now().toString(),
        ownerName,
        ownerNumber,
        propertyType,
        paymentType,
        totalPrice,
        downPayment,
        monthlyInstallment,
        installmentYears,
        overPrice,
        images,
        pdfs,
        createdAt: new Date().toISOString()
    };
    
    properties.push(newProperty);
    saveProperties();
    displayProperties();
    resetForm();
}

function resetForm() {
    document.getElementById('propertyForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('pdfPreview').innerHTML = '';
    imageFiles = [];
    pdfFiles = [];
    togglePaymentFields();
}

function displayProperties() {
    const propertyList = document.getElementById('property-list');
    
    if (properties.length === 0) {
        propertyList.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray);">
                <h3>No properties added yet</h3>
                <p>Add your first property using the form above</p>
            </div>
        `;
        return;
    }
    
    propertyList.innerHTML = properties.map((property, index) => `
        <div class="property-card">
            <div class="property-card-header">
                <h3 class="property-card-title">${property.ownerName}</h3>
            </div>
            <div class="property-card-body">
                <p class="property-card-text">
                    <strong>Type:</strong> ${property.propertyType}
                </p>
                <p class="property-card-text">
                    <strong>Payment:</strong> 
                    <span class="badge ${property.paymentType === 'cash' ? 'badge-primary' : 'badge-secondary'}">
                        ${property.paymentType}
                    </span>
                </p>
                <p class="property-card-text">
                    <strong>Total Price:</strong> ${property.totalPrice}
                </p>
                
                ${property.paymentType === 'installment' ? `
                    <p class="property-card-text">
                        <strong>Installment:</strong> 
                        ${property.monthlyInstallment}/month for ${property.installmentYears} years
                    </p>
                    <p class="property-card-text">
                        <strong>Downpayment:</strong> ${property.downPayment}
                    </p>
                    <p class="property-card-text">
                        <strong>Over Price:</strong> ${property.overPrice}
                    </p>
                ` : ''}
                
                <div class="property-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="showDetails(${index})">
                        Details
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editProperty(${index})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="showDeleteConfirmation(${index})">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function showDetails(index) {
    const property = properties[index];
    const detailsContent = document.getElementById('detailsContent');
    
    detailsContent.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Owner Name:</div>
            <div class="detail-value">${property.ownerName}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Phone Number:</div>
            <div class="detail-value">${property.ownerNumber}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Property Type:</div>
            <div class="detail-value">${property.propertyType}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Payment Type:</div>
            <div class="detail-value">
                <span class="badge ${property.paymentType === 'cash' ? 'badge-primary' : 'badge-secondary'}">
                    ${property.paymentType}
                </span>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Total Price:</div>
            <div class="detail-value">${property.totalPrice}</div>
        </div>
        
        ${property.paymentType === 'installment' ? `
            <div class="detail-row">
                <div class="detail-label">Downpayment:</div>
                <div class="detail-value">${property.downPayment}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Monthly Installment:</div>
                <div class="detail-value">${property.monthlyInstallment}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Installment Years:</div>
                <div class="detail-value">${property.installmentYears}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Over Price:</div>
                <div class="detail-value">${property.overPrice}</div>
            </div>
        ` : ''}
        
        ${property.images.length > 0 ? `
            <div class="detail-row">
                <div class="detail-label">Images:</div>
                <div class="detail-value"></div>
            </div>
            <div class="preview-grid">
                ${property.images.map(img => `
                    <div class="preview-item">
                        <img src="${img.url}" alt="${img.name}">
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${property.pdfs.length > 0 ? `
            <div class="detail-row">
                <div class="detail-label">Documents:</div>
                <div class="detail-value"></div>
            </div>
            <div>
                ${property.pdfs.map(pdf => `
                    <div class="pdf-item" style="margin-bottom:10px;">
                        <div class="pdf-icon">📄</div>
                        <div>
                            <div style="font-weight:500;">${pdf.name}</div>
                            <a href="${pdf.url}" target="_blank" style="font-size:0.8rem;color:var(--primary);">View Document</a>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    document.getElementById('detailsModal').style.display = "flex";
}

function showDeleteConfirmation(index) {
    currentDeleteIndex = index;
    const property = properties[index];
    document.getElementById('confirmMessage').textContent = `Are you sure you want to delete ${property.ownerName}'s property?`;
    document.getElementById('confirmModal').style.display = "flex";
}

function confirmDelete() {
    if (currentDeleteIndex !== null) {
        properties.splice(currentDeleteIndex, 1);
        saveProperties();
        displayProperties();
        currentDeleteIndex = null;
    }
    closeModal('confirmModal');
}

function editProperty(index) {
    currentEditIndex = index;
    const property = properties[index];
    
    // Populate the edit form with property data
    document.getElementById('editOwnerName').value = property.ownerName;
    document.getElementById('editOwnerNumber').value = property.ownerNumber;
    document.getElementById('editPropertyType').value = property.propertyType;
    document.getElementById('editTotalPrice').value = property.totalPrice;
    
    // Set payment type radio button
    document.querySelector(`input[name="editPaymentType"][value="${property.paymentType}"]`).checked = true;
    
    if (property.paymentType === 'installment') {
        document.getElementById('editDownPayment').value = property.downPayment;
        document.getElementById('editMonthlyInstallment').value = property.monthlyInstallment;
        document.getElementById('editInstallmentYears').value = property.installmentYears;
        document.getElementById('editOverPrice').value = property.overPrice;
    }
    
    // Toggle installment fields based on payment type
    toggleEditPaymentFields();
    
    // Show the edit modal
    document.getElementById('editModal').style.display = "flex";
}

function saveEditedProperty() {
    if (currentEditIndex === null) return;
    
    const ownerName = document.getElementById('editOwnerName').value.trim();
    const ownerNumber = document.getElementById('editOwnerNumber').value.trim();
    const propertyType = document.getElementById('editPropertyType').value;
    const paymentType = document.querySelector('input[name="editPaymentType"]:checked').value;
    const totalPrice = document.getElementById('editTotalPrice').value;
    
    let downPayment = '';
    let monthlyInstallment = '';
    let installmentYears = '';
    let overPrice = '';
    
    if (paymentType === 'installment') {
        downPayment = document.getElementById('editDownPayment').value;
        monthlyInstallment = document.getElementById('editMonthlyInstallment').value;
        installmentYears = document.getElementById('editInstallmentYears').value;
        overPrice = document.getElementById('editOverPrice').value;
    }
    
    // Validate required fields
    if (!ownerName || !ownerNumber || !propertyType || !totalPrice) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (paymentType === 'installment' && (!downPayment || !monthlyInstallment || !overPrice)) {
        alert('Please fill in all installment details');
        return;
    }

    // Update the property
    const property = properties[currentEditIndex];
    property.ownerName = ownerName;
    property.ownerNumber = ownerNumber;
    property.propertyType = propertyType;
    property.paymentType = paymentType;
    property.totalPrice = totalPrice;
    property.downPayment = downPayment;
    property.monthlyInstallment = monthlyInstallment;
    property.installmentYears = installmentYears;
    property.overPrice = overPrice;
    
    saveProperties();
    displayProperties();
    closeModal('editModal');
    currentEditIndex = null;
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function saveProperties() {
    localStorage.setItem("properties", JSON.stringify(properties));
}