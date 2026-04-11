
export const getInvoiceHTML = (data, logoBase64, mapimageBase64) => {
  const style = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    :root {
      --primary: #0F172A;
      --secondary: #64748B;
      --accent: #3B82F6;
      --success: #22C55E;
      --border: #E2E8F0;
      --bg-alt: #F8FAFC;
    }

    body { 
      font-family: 'Inter', -apple-system, sans-serif; 
      padding: 0; 
      margin: 0; 
      color: var(--primary);
      background-color: #fff;
    }

    .page {
      padding: 40px;
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--primary);
      margin: 0;
    }

    .invoice-meta {
      font-size: 14px;
      color: var(--secondary);
      margin-top: 4px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .summary-item label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--secondary);
      margin-bottom: 4px;
    }

    .summary-item value {
      display: block;
      font-size: 16px;
      font-weight: 600;
    }

    .map-container {
      position: relative;
      width: 100%;
      height: 280px;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 32px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .map-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .map-stats {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      padding: 12px 20px;
      border-radius: 8px;
      display: flex;
      gap: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
    }

    .stat-label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      color: var(--secondary);
      text-transform: uppercase;
    }

    .details-section {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 40px;
    }

    .route-details {
      position: relative;
      padding-left: 28px;
    }

    .route-line {
      position: absolute;
      left: 9px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: repeating-linear-gradient(to bottom, var(--border), var(--border) 4px, transparent 4px, transparent 8px);
    }

    .route-point {
      position: relative;
      margin-bottom: 24px;
    }

    .route-point:last-child {
      margin-bottom: 0;
    }

    .point-icon {
      position: absolute;
      left: -28px;
      top: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border: 2px solid var(--border);
      border-radius: 50%;
      z-index: 1;
    }

    .point-icon.pickup { border-color: var(--success); }
    .point-icon.drop { border-color: #EF4444; }

    .point-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary);
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .point-address {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
    }

    .info-card {
      background: var(--bg-alt);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .info-group {
      margin-bottom: 20px;
    }

    .info-group:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary);
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 14px;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .status-completed { background: #DCFCE7; color: #166534; }
    .status-paid { background: #DBEAFE; color: #1E40AF; }

    .bill-section {
      margin-top: 20px;
    }

    .bill-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 32px;
    }

    .bill-table th {
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary);
      text-transform: uppercase;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--primary);
    }

    .bill-table td {
      padding: 20px 0;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }

    .bill-table .amount {
      text-align: right;
      font-weight: 600;
    }

    .total-row td {
      border-bottom: none;
      padding-top: 32px;
    }

    .total-label {
      font-size: 18px;
      font-weight: 700;
    }

    .total-amount {
      font-size: 28px;
      font-weight: 800;
      text-align: right;
      color: var(--accent);
    }

    .footer {
      margin-top: auto;
      padding-top: 40px;
      text-align: center;
      border-top: 1px solid var(--border);
    }

    .footer-text {
      font-size: 12px;
      color: var(--secondary);
      line-height: 1.6;
    }

    .thank-you {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--primary);
    }

    @media print {
      .page { box-shadow: none; margin: 0; width: 100%; min-height: 100%; }
      body { background: white; }
    }
  </style>`;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      ${style}
    </head>
    <body>
      <!-- PAGE 1: RIDE SUMMARY -->
      <div class="page">
        <div class="header">
          <div>
            <h1 class="invoice-title">Ride Summary</h1>
            <p class="invoice-meta">Ride ID: ${data.invoiceId} • ${data.date}</p>
          </div>
          <img src="data:image/png;base64,${logoBase64}" width="120" alt="Logo" />
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <label>Captain</label>
            <value>${data.captainname}</value>
          </div>
          <div class="summary-item">
            <label>Vehicle Number</label>
            <value>${data.vehiclenum}</value>
          </div>
          <div class="summary-item">
            <label>Ride Status</label>
            <div class="status-badge status-completed">Completed</div>
          </div>
        </div>

        <div class="map-container">
          <img src="data:image/png;base64,${mapimageBase64}" class="map-image" alt="Trip Map" />
          <div class="map-stats">
            <div class="stat-item">
              <span class="stat-value">3.28 km</span>
              <span class="stat-label">Distance</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">9.60 mins</span>
              <span class="stat-label">Duration</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <div class="route-details">
            <div class="route-line"></div>
            <div class="route-point">
              <div class="point-icon pickup"></div>
              <div class="point-label">Pickup Location</div>
              <div class="point-address">${data.pickupaddress}</div>
            </div>
            <div class="route-point">
              <div class="point-icon drop"></div>
              <div class="point-label">Drop Location</div>
              <div class="point-address">${data.dropaddress}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-group">
              <div class="info-label">Customer Name</div>
              <div class="info-value">${data.username}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Payment Mode</div>
              <div class="status-badge status-paid">Cash Payment</div>
            </div>
            <div class="info-group">
              <div class="info-label">Service Category</div>
              <div class="info-value">Local Transport</div>
            </div>
            <div class="info-group">
              <div class="info-label">Place of Ride</div>
              <div class="info-value">Tamil Nadu</div>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGE 2: TAX INVOICE & BILLING -->
      <div class="page">
        <div class="header">
          <div>
            <h1 class="invoice-title">Tax Invoice</h1>
            <p class="invoice-meta">Ride ID: ${data.invoiceId} • Invoice No: ${data.invoiceNum}</p>
          </div>
          <img src="data:image/png;base64,${logoBase64}" width="120" alt="Logo" />
        </div>

        <div class="summary-grid" style="grid-template-columns: repeat(2, 1fr);">
          <div class="summary-item">
            <label>GST Number</label>
            <value>${data.gst}</value>
          </div>
          <div class="summary-item" style="text-align: right;">
            <label>Invoice Date</label>
            <value>${data.date}</value>
          </div>
        </div>

        <div class="bill-section">
          <table class="bill-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Ride Fare</td>
                <td class="amount">${data.RideCharge}</td>
              </tr>
              <tr>
                <td>Platform Convenience & Booking Fees</td>
                <td class="amount">${data.Allowance}</td>
              </tr>
              <tr>
                <td style="color: var(--success);">Promotional Discount</td>
                <td class="amount" style="color: var(--success);">- 10.00</td>
              </tr>
              <tr>
                <td>Central GST (2.5%)</td>
                <td class="amount">0.96</td>
              </tr>
              <tr>
                <td>State GST (2.5%)</td>
                <td class="amount">0.96</td>
              </tr>
              <tr class="total-row">
                <td class="total-label">Grand Total Paid</td>
                <td class="total-amount">₹ ${data.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div class="thank-you">We enjoyed having you on board, ${data.username}!</div>
          <div class="footer-text">
            This invoice is system-generated and does not require a physical signature.<br />
            It is issued by Roppen Transportation Services Pvt Ltd on behalf of the Captain.<br />
            For support or queries, please reach out via the app's Help & Support section.
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};