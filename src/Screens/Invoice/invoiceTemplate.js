
// export const getInvoiceHTML = (data, logoBase64, mapimageBase64) => {
//   const style = `
//   <style>
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

//     :root {
//       --primary: #0F172A;
//       --secondary: #64748B;
//       --accent: #3B82F6;
//       --success: #22C55E;
//       --border: #E2E8F0;
//       --bg-alt: #F8FAFC;
//     }

//     body { 
//       font-family: 'Inter', -apple-system, sans-serif; 
//       padding: 0; 
//       margin: 0; 
//       color: var(--primary);
//       background-color: #fff;
//     }

//     .page {
//       padding: 40px;
//       page-break-after: always;
//       min-height: 100vh;
//       display: flex;
//       flex-direction: column;
//       box-sizing: border-box;
//     }

//     .page:last-child {
//       page-break-after: auto;
//     }

//     .header {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       margin-bottom: 40px;
//     }

//     .invoice-title {
//       font-size: 32px;
//       font-weight: 800;
//       letter-spacing: -0.025em;
//       color: var(--primary);
//       margin: 0;
//     }

//     .invoice-meta {
//       font-size: 14px;
//       color: var(--secondary);
//       margin-top: 4px;
//     }

//     .summary-grid {
//       display: grid;
//       grid-template-columns: repeat(3, 1fr);
//       gap: 24px;
//       margin-bottom: 32px;
//       padding-bottom: 24px;
//       border-bottom: 1px solid var(--border);
//     }

//     .summary-item label {
//       display: block;
//       font-size: 12px;
//       font-weight: 600;
//       text-transform: uppercase;
//       letter-spacing: 0.05em;
//       color: var(--secondary);
//       margin-bottom: 4px;
//     }

//     .summary-item value {
//       display: block;
//       font-size: 16px;
//       font-weight: 600;
//     }

//     .map-container {
//       position: relative;
//       width: 100%;
//       height: 280px;
//       border-radius: 12px;
//       overflow: hidden;
//       margin-bottom: 32px;
//       box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
//     }

//     .map-image {
//       width: 100%;
//       height: 100%;
//       object-fit: cover;
//     }

//     .map-stats {
//       position: absolute;
//       bottom: 16px;
//       right: 16px;
//       background: rgba(255, 255, 255, 0.9);
//       backdrop-filter: blur(8px);
//       padding: 12px 20px;
//       border-radius: 8px;
//       display: flex;
//       gap: 24px;
//       border: 1px solid rgba(255, 255, 255, 0.2);
//     }

//     .stat-item {
//       text-align: center;
//     }

//     .stat-value {
//       display: block;
//       font-size: 14px;
//       font-weight: 700;
//       color: var(--primary);
//     }

//     .stat-label {
//       display: block;
//       font-size: 10px;
//       font-weight: 600;
//       color: var(--secondary);
//       text-transform: uppercase;
//     }

//     .details-section {
//       display: grid;
//       grid-template-columns: 1.5fr 1fr;
//       gap: 40px;
//     }

//     .route-details {
//       position: relative;
//       padding-left: 28px;
//     }

//     .route-line {
//       position: absolute;
//       left: 9px;
//       top: 10px;
//       bottom: 10px;
//       width: 2px;
//       background: repeating-linear-gradient(to bottom, var(--border), var(--border) 4px, transparent 4px, transparent 8px);
//     }

//     .route-point {
//       position: relative;
//       margin-bottom: 24px;
//     }

//     .route-point:last-child {
//       margin-bottom: 0;
//     }

//     .point-icon {
//       position: absolute;
//       left: -28px;
//       top: 2px;
//       width: 20px;
//       height: 20px;
//       background: white;
//       border: 2px solid var(--border);
//       border-radius: 50%;
//       z-index: 1;
//     }

//     .point-icon.pickup { border-color: var(--success); }
//     .point-icon.drop { border-color: #EF4444; }

//     .point-label {
//       font-size: 12px;
//       font-weight: 600;
//       color: var(--secondary);
//       text-transform: uppercase;
//       margin-bottom: 4px;
//     }

//     .point-address {
//       font-size: 14px;
//       font-weight: 500;
//       line-height: 1.5;
//     }

//     .info-card {
//       background: var(--bg-alt);
//       padding: 24px;
//       border-radius: 12px;
//       border: 1px solid var(--border);
//     }

//     .info-group {
//       margin-bottom: 20px;
//     }

//     .info-group:last-child {
//       margin-bottom: 0;
//     }

//     .info-label {
//       font-size: 11px;
//       font-weight: 600;
//       color: var(--secondary);
//       text-transform: uppercase;
//       margin-bottom: 4px;
//     }

//     .info-value {
//       font-size: 14px;
//       font-weight: 600;
//     }

//     .status-badge {
//       display: inline-block;
//       padding: 4px 12px;
//       border-radius: 20px;
//       font-size: 12px;
//       font-weight: 700;
//       text-transform: uppercase;
//       margin-top: 4px;
//     }

//     .status-completed { background: #DCFCE7; color: #166534; }
//     .status-paid { background: #DBEAFE; color: #1E40AF; }

//     .bill-section {
//       margin-top: 20px;
//     }

//     .bill-table {
//       width: 100%;
//       border-collapse: collapse;
//       margin-top: 32px;
//     }

//     .bill-table th {
//       text-align: left;
//       font-size: 12px;
//       font-weight: 600;
//       color: var(--secondary);
//       text-transform: uppercase;
//       padding-bottom: 12px;
//       border-bottom: 2px solid var(--primary);
//     }

//     .bill-table td {
//       padding: 20px 0;
//       border-bottom: 1px solid var(--border);
//       font-size: 14px;
//     }

//     .bill-table .amount {
//       text-align: right;
//       font-weight: 600;
//     }

//     .total-row td {
//       border-bottom: none;
//       padding-top: 32px;
//     }

//     .total-label {
//       font-size: 18px;
//       font-weight: 700;
//     }

//     .total-amount {
//       font-size: 28px;
//       font-weight: 800;
//       text-align: right;
//       color: var(--accent);
//     }

//     .footer {
//       margin-top: auto;
//       padding-top: 40px;
//       text-align: center;
//       border-top: 1px solid var(--border);
//     }

//     .footer-text {
//       font-size: 12px;
//       color: var(--secondary);
//       line-height: 1.6;
//     }

//     .thank-you {
//       font-size: 18px;
//       font-weight: 700;
//       margin-bottom: 12px;
//       color: var(--primary);
//     }

//     @media print {
//       .page { box-shadow: none; margin: 0; width: 100%; min-height: 100%; }
//       body { background: white; }
//     }
//   </style>`;

//   return `
//   <!DOCTYPE html>
//   <html>
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
//       ${style}
//     </head>
//     <body>
//       <!-- PAGE 1: RIDE SUMMARY -->
//       <div class="page">
//         <div class="header">
//           <div>
//             <h1 class="invoice-title">Ride Summary</h1>
//             <p class="invoice-meta">Ride ID: ${data.invoiceId} • ${data.date}</p>
//           </div>
//           <img src="data:image/png;base64,${logoBase64}" width="120" alt="Logo" />
//         </div>

//         <div class="summary-grid">
//           <div class="summary-item">
//             <label>Captain</label>
//             <value>${data.captainname}</value>
//           </div>
//           <div class="summary-item">
//             <label>Vehicle Number</label>
//             <value>${data.vehiclenum}</value>
//           </div>
//           <div class="summary-item">
//             <label>Ride Status</label>
//             <div class="status-badge status-completed">Completed</div>
//           </div>
//         </div>

//         <div class="map-container">
//           <img src="data:image/png;base64,${mapimageBase64}" class="map-image" alt="Trip Map" />
//           <div class="map-stats">
//             <div class="stat-item">
//               <span class="stat-value">3.28 km</span>
//               <span class="stat-label">Distance</span>
//             </div>
//             <div class="stat-item">
//               <span class="stat-value">9.60 mins</span>
//               <span class="stat-label">Duration</span>
//             </div>
//           </div>
//         </div>

//         <div class="details-section">
//           <div class="route-details">
//             <div class="route-line"></div>
//             <div class="route-point">
//               <div class="point-icon pickup"></div>
//               <div class="point-label">Pickup Location</div>
//               <div class="point-address">${data.pickupaddress}</div>
//             </div>
//             <div class="route-point">
//               <div class="point-icon drop"></div>
//               <div class="point-label">Drop Location</div>
//               <div class="point-address">${data.dropaddress}</div>
//             </div>
//           </div>

//           <div class="info-card">
//             <div class="info-group">
//               <div class="info-label">Customer Name</div>
//               <div class="info-value">${data.username}</div>
//             </div>
//             <div class="info-group">
//               <div class="info-label">Payment Mode</div>
//               <div class="status-badge status-paid">Cash Payment</div>
//             </div>
//             <div class="info-group">
//               <div class="info-label">Service Category</div>
//               <div class="info-value">Local Transport</div>
//             </div>
//             <div class="info-group">
//               <div class="info-label">Place of Ride</div>
//               <div class="info-value">Tamil Nadu</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- PAGE 2: TAX INVOICE & BILLING -->
//       <div class="page">
//         <div class="header">
//           <div>
//             <h1 class="invoice-title">Tax Invoice</h1>
//             <p class="invoice-meta">Ride ID: ${data.invoiceId} • Invoice No: ${data.invoiceNum}</p>
//           </div>
//           <img src="data:image/png;base64,${logoBase64}" width="120" alt="Logo" />
//         </div>

//         <div class="summary-grid" style="grid-template-columns: repeat(2, 1fr);">
//           <div class="summary-item">
//             <label>GST Number</label>
//             <value>${data.gst}</value>
//           </div>
//           <div class="summary-item" style="text-align: right;">
//             <label>Invoice Date</label>
//             <value>${data.date}</value>
//           </div>
//         </div>

//         <div class="bill-section">
//           <table class="bill-table">
//             <thead>
//               <tr>
//                 <th>Description</th>
//                 <th style="text-align: right;">Amount (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>Total Ride Fare</td>
//                 <td class="amount">${data.RideCharge}</td>
//               </tr>
//               <tr>
//                 <td>Platform Convenience & Booking Fees</td>
//                 <td class="amount">${data.Allowance}</td>
//               </tr>
//               <tr>
//                 <td style="color: var(--success);">Promotional Discount</td>
//                 <td class="amount" style="color: var(--success);">- 10.00</td>
//               </tr>
//               <tr>
//                 <td>Central GST (2.5%)</td>
//                 <td class="amount">0.96</td>
//               </tr>
//               <tr>
//                 <td>State GST (2.5%)</td>
//                 <td class="amount">0.96</td>
//               </tr>
//               <tr class="total-row">
//                 <td class="total-label">Grand Total Paid</td>
//                 <td class="total-amount">₹ ${data.total}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <div class="footer">
//           <div class="thank-you">We enjoyed having you on board, ${data.username}!</div>
//           <div class="footer-text">
//             This invoice is system-generated and does not require a physical signature.<br />
//             It is issued by Roppen Transportation Services Pvt Ltd on behalf of the Captain.<br />
//             For support or queries, please reach out via the app's Help & Support section.
//           </div>
//         </div>
//       </div>
//     </body>
//   </html>
//   `;
// };

export const getInvoiceHTML = (data, logoBase64, mapimageBase64) => {
  const distance = data.distance || "3.28 km";
  const duration = data.duration || "9.60 mins";

  const style = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    :root {
      --ink: #14192B;
      --ink-soft: #545A6E;
      --paper: #FBFAF6;
      --paper-alt: #F1EEE4;
      --teal: #0E7C66;
      --teal-dark: #0A5B4C;
      --amber: #D98E2B;
      --brick: #B94A3D;
      --rule: #DCD6C7;
      --white: #FFFFFF;
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'IBM Plex Sans', -apple-system, sans-serif;
      padding: 0;
      margin: 0;
      color: var(--ink);
      background-color: var(--paper);
    }

    .mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; }

    .page {
      padding: 36px 40px;
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background-color: var(--paper);
    }

    .page:last-child { page-break-after: auto; }

    /* ---------- Header ---------- */

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }

    .eyebrow {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--teal);
      margin: 0 0 6px 0;
    }

    .invoice-meta {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      color: var(--ink-soft);
      margin: 4px 0 0 0;
    }

    .logo { width: 108px; opacity: 0.92; }

    /* ---------- Route headline (odometer strip) ---------- */

    .route-headline {
      background: var(--ink);
      color: var(--paper);
      border-radius: 14px;
      padding: 22px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      gap: 20px;
    }

    .route-cities {
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.01em;
      min-width: 0;
    }

    .route-cities span.place {
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .route-dots {
      flex: 1;
      min-width: 40px;
      height: 1px;
      background-image: linear-gradient(to right, rgba(251,250,246,0.45) 0 6px, transparent 6px 12px);
      background-size: 12px 1px;
      position: relative;
    }

    .route-dots::after {
      content: '';
      position: absolute;
      right: -2px;
      top: -3px;
      width: 7px;
      height: 7px;
      border-top: 2px solid rgba(251,250,246,0.75);
      border-right: 2px solid rgba(251,250,246,0.75);
      transform: rotate(45deg);
    }

    .route-stats {
      display: flex;
      gap: 26px;
      flex-shrink: 0;
    }

    .route-stat { text-align: right; }

    .route-stat .val {
      display: block;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 17px;
      font-weight: 600;
      color: var(--paper);
    }

    .route-stat .lbl {
      display: block;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(251,250,246,0.6);
      margin-top: 2px;
    }

    /* ---------- Map ---------- */

    .map-container {
      position: relative;
      width: 100%;
      height: 220px;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 24px;
      border: 1px solid var(--rule);
    }

    .map-image { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* ---------- Ticket stub layout ---------- */

    .ticket-wrap {
      position: relative;
      display: flex;
      background: var(--white);
      border-radius: 14px;
      border: 1px solid var(--rule);
      overflow: hidden;
      flex: 1;
    }

    .ticket-main {
      flex: 1;
      padding: 26px 28px;
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 32px;
    }

    .perf-notch-top, .perf-notch-bottom {
      position: absolute;
      width: 18px;
      height: 18px;
      background: var(--paper);
      border-radius: 50%;
      right: 96px;
      margin-right: -9px;
      z-index: 2;
      border: 1px solid var(--rule);
    }

    .perf-notch-top { top: -9px; }
    .perf-notch-bottom { bottom: -9px; }

    .route-details { position: relative; padding-left: 26px; }

    .route-line {
      position: absolute;
      left: 8px;
      top: 9px;
      bottom: 9px;
      width: 2px;
      background: repeating-linear-gradient(to bottom, var(--rule), var(--rule) 4px, transparent 4px, transparent 8px);
    }

    .route-point { position: relative; margin-bottom: 22px; }
    .route-point:last-child { margin-bottom: 0; }

    .point-icon {
      position: absolute;
      left: -26px;
      top: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border: 3px solid var(--rule);
      border-radius: 50%;
      z-index: 1;
    }

    .point-icon.pickup { border-color: var(--teal); }
    .point-icon.drop { border-color: var(--brick); }

    .point-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.08em;
      color: var(--ink-soft);
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .point-address { font-size: 13.5px; font-weight: 500; line-height: 1.5; }

    .ride-facts { display: flex; flex-direction: column; gap: 16px; }

    .fact-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.08em;
      color: var(--ink-soft);
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .fact-value { font-size: 14px; font-weight: 600; }

    .status-badge {
      display: inline-block;
      padding: 3px 11px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 2px;
    }

    .status-completed { background: #E1F3ED; color: var(--teal-dark); }
    .status-paid { background: #FBEEDD; color: #9A5F0F; }

    /* ---------- Stub (right side of ticket) ---------- */

    .ticket-stub {
      width: 108px;
      flex-shrink: 0;
      background: var(--ink);
      color: var(--paper);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 22px 0 16px 0;
      border-left: 2px dashed var(--rule);
    }

    .stub-id {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      letter-spacing: 0.12em;
      font-weight: 500;
    }

    .stub-barcode {
      width: 26px;
      height: 70px;
      background: repeating-linear-gradient(to right, var(--paper) 0 2px, transparent 2px 3px, var(--paper) 3px 4px, transparent 4px 7px, var(--paper) 7px 9px, transparent 9px 10px);
      opacity: 0.85;
    }

    /* ---------- Fare table (page 2) ---------- */

    .torn-strip {
      width: 100%;
      height: 16px;
      background: var(--teal);
      clip-path: polygon(0% 100%,0% 20%,4% 100%,8% 20%,12% 100%,16% 20%,20% 100%,24% 20%,28% 100%,32% 20%,36% 100%,40% 20%,44% 100%,48% 20%,52% 100%,56% 20%,60% 100%,64% 20%,68% 100%,72% 20%,76% 100%,80% 20%,84% 100%,88% 20%,92% 100%,96% 20%,100% 100%,100% 20%);
      border-radius: 14px 14px 0 0;
    }

    .invoice-card {
      background: var(--white);
      border: 1px solid var(--rule);
      border-top: none;
      border-radius: 0 0 14px 14px;
      padding: 26px 28px 30px 28px;
      margin-bottom: 24px;
    }

    .gst-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 18px;
      margin-bottom: 18px;
      border-bottom: 1px solid var(--rule);
    }

    .gst-row .fact-value { font-family: 'IBM Plex Mono', monospace; }

    .bill-table { width: 100%; border-collapse: collapse; }

    .bill-table th {
      text-align: left;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10.5px;
      font-weight: 500;
      letter-spacing: 0.08em;
      color: var(--ink-soft);
      text-transform: uppercase;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--ink);
    }

    .bill-table td {
      padding: 14px 0;
      border-bottom: 1px dashed var(--rule);
      font-size: 13.5px;
    }

    .bill-table .amount {
      text-align: right;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 500;
    }

    .total-row td { border-bottom: none; padding-top: 20px; }

    .total-label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 600;
    }

    .total-amount {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 24px;
      font-weight: 600;
      text-align: right;
      color: var(--teal-dark);
    }

    .total-box {
      background: var(--paper-alt);
      border-radius: 10px;
      padding: 2px 16px;
    }

    /* ---------- Footer ---------- */

    .footer {
      margin-top: auto;
      padding-top: 28px;
      text-align: center;
    }

    .footer-rule {
      width: 100%;
      height: 1px;
      background-image: linear-gradient(to right, var(--rule) 0 6px, transparent 6px 12px);
      background-size: 12px 1px;
      margin-bottom: 20px;
    }

    .thank-you {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      color: var(--ink);
    }

    .footer-text {
      font-size: 11.5px;
      color: var(--ink-soft);
      line-height: 1.7;
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
      ${style}
    </head>
    <body>
      <!-- PAGE 1: RIDE SUMMARY -->
      <div class="page">
        <div class="header">
          <div>
            <p class="eyebrow">Ride Receipt</p>
            <p class="invoice-meta">${data.invoiceId} &nbsp;·&nbsp; ${data.date}</p>
          </div>
          <img src="data:image/png;base64,${logoBase64}" class="logo" alt="Logo" />
        </div>

        <div class="route-headline">
          <div class="route-cities">
            <span class="place">${data.pickupaddress.split(',')[0]}</span>
            <span class="route-dots"></span>
            <span class="place">${data.dropaddress.split(',')[0]}</span>
          </div>
          <div class="route-stats">
            <div class="route-stat">
              <span class="val mono">${distance}</span>
              <span class="lbl">Distance</span>
            </div>
            <div class="route-stat">
              <span class="val mono">${duration}</span>
              <span class="lbl">Duration</span>
            </div>
          </div>
        </div>

        <div class="map-container">
          <img src="data:image/png;base64,${mapimageBase64}" class="map-image" alt="Trip Map" />
        </div>

        <div class="ticket-wrap">
          <div class="perf-notch-top"></div>
          <div class="perf-notch-bottom"></div>
          <div class="ticket-main">
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

            <div class="ride-facts">
              <div>
                <div class="fact-label">Captain</div>
                <div class="fact-value">${data.captainname}</div>
              </div>
              <div>
                <div class="fact-label">Vehicle Number</div>
                <div class="fact-value mono">${data.vehiclenum}</div>
              </div>
              <div>
                <div class="fact-label">Customer</div>
                <div class="fact-value">${data.username}</div>
              </div>
              <div>
                <div class="fact-label">Status</div>
                <div class="status-badge status-completed">Completed</div>
              </div>
            </div>
          </div>
          <div class="ticket-stub">
            <div class="stub-id mono">${data.invoiceId}</div>
            <div class="stub-barcode"></div>
          </div>
        </div>
      </div>

      <!-- PAGE 2: TAX INVOICE & BILLING -->
      <div class="page">
        <div class="header">
          <div>
            <p class="eyebrow">Tax Invoice</p>
            <p class="invoice-meta">${data.invoiceId} &nbsp;·&nbsp; Invoice No. ${data.invoiceNum}</p>
          </div>
          <img src="data:image/png;base64,${logoBase64}" class="logo" alt="Logo" />
        </div>

        <div class="torn-strip"></div>
        <div class="invoice-card">
          <div class="gst-row">
            <div>
              <div class="fact-label">GST Number</div>
              <div class="fact-value">${data.gst}</div>
            </div>
            <div style="text-align: right;">
              <div class="fact-label">Invoice Date</div>
              <div class="fact-value">${data.date}</div>
            </div>
          </div>

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
                <td>Platform Convenience &amp; Booking Fees</td>
                <td class="amount">${data.Allowance}</td>
              </tr>
              <tr>
                <td style="color: var(--teal-dark);">Promotional Discount</td>
                <td class="amount" style="color: var(--teal-dark);">− 10.00</td>
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
                <td>
                  <div class="total-box">
                    <div class="total-amount">₹ ${data.total}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div class="footer-rule"></div>
          <div class="thank-you">Thanks for riding with us, ${data.username}.</div>
          <div class="footer-text">
            This invoice is system-generated and does not require a physical signature.<br />
            It is issued by Roppen Transportation Services Pvt Ltd on behalf of the Captain.<br />
            For support or queries, please reach out via the app's Help &amp; Support section.
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};