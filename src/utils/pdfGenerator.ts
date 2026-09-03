import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

interface User {
  full_name?: string;
  email?: string;
  phone_number?: string;
}

interface Transaction {
  id: string;
  title: string;
  amount: number | string;
  type: string;
  status: string;
  status: string;
  date: string;
  time: string;
  description?: string;
  rideId?: string;
  previousBalance?: number | string;
  newBalance?: number | string;
}

const generateWalletStatementHTML = (
  user: User | null,
  balance: number,
  transactions: Transaction[]
) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate totals
  let totalCredits = 0;
  let totalDebits = 0;

  transactions.forEach((txn) => {
    const amt = Number(txn.amount);
    if (amt > 0) {
      totalCredits += amt;
    } else {
      totalDebits += Math.abs(amt);
    }
  });

  const transactionRows = transactions
    .map((txn) => {
      const isCredit = Number(txn.amount) > 0;
      const amountColor = isCredit ? '#10B981' : '#EF4444';
      const formattedAmount = `${isCredit ? '+' : ''}₹${Math.abs(Number(txn.amount)).toLocaleString('en-IN')}`;

      return `
        <tr>
          <td>${txn.date} ${txn.time}</td>
          <td>${txn.id}</td>
          <td>${txn.title}</td>
          <td>${(txn.type || '').replace(/_/g, ' ')}</td>
          <td style="color: ${amountColor}; font-weight: bold;">${formattedAmount}</td>
          <td>
            <span class="status-badge ${txn.status === 'SUCCESS' || txn.status === 'COMPLETED' ? 'status-success' : 'status-pending'}">
              ${txn.status}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wallet Transaction Statement</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 40px;
          background-color: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1E3A8A;
          margin: 0 0 10px 0;
        }
        .user-details, .statement-details {
          font-size: 14px;
          line-height: 1.6;
          color: #4B5563;
        }
        .summary-cards {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          flex: 1;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 15px;
        }
        .summary-label {
          font-size: 12px;
          color: #64748B;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #1E293B;
        }
        .summary-value.credit { color: #10B981; }
        .summary-value.debit { color: #EF4444; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #F1F5F9;
          color: #475569;
          font-weight: 600;
          text-align: left;
          padding: 12px;
          font-size: 14px;
          border-bottom: 2px solid #CBD5E1;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #E2E8F0;
          font-size: 14px;
          color: #334155;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-success {
          background-color: #ECFDF5;
          color: #10B981;
        }
        .status-pending {
          background-color: #FFFBEB;
          color: #F59E0B;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #E2E8F0;
          padding-top: 20px;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">Wallet Transaction Statement</h1>
          <div class="user-details">
            <strong>${user?.full_name || 'User'}</strong><br>
            ${user?.email ? `${user.email}<br>` : ''}
            ${user?.phone_number ? `${user.phone_number}` : ''}
          </div>
        </div>
        <div class="statement-details">
          <strong>Generated On:</strong> ${currentDate}<br>
          <strong>Total Transactions:</strong> ${transactions.length}
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">Closing Balance</div>
          <div class="summary-value">₹${Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Credits</div>
          <div class="summary-value credit">+₹${totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Debits</div>
          <div class="summary-value debit">-₹${totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Transaction ID</th>
            <th>Description</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${transactionRows.length > 0 ? transactionRows : '<tr><td colspan="6" style="text-align: center;">No transactions available.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        This is a computer-generated document. No signature is required.<br>
        VDrive Wallet Statement
      </div>
    </body>
    </html>
  `;
};

export const generateStatementPDF = async (
  user: User | null,
  balance: number,
  transactions: Transaction[]
) => {
  const html = generateWalletStatementHTML(user, balance, transactions);

  let options = {
    html: html,
    fileName: `Wallet_Statement_${Date.now()}`,
    base64: true,
  };

  const file = await generatePDF(options);
  return file;
};

export const downloadWalletStatement = async (
  user: User | null,
  balance: number,
  transactions: Transaction[]
) => {
  try {
    const file = await generateStatementPDF(user, balance, transactions);
    const filePath = file.filePath;

    if (!filePath) throw new Error("Failed to generate PDF path");

    if (Platform.OS === 'android') {
      // Move to a more accessible downloads folder on Android if needed, 
      // or simply rely on the Documents directory created by RNHTMLtoPDF
      const destPath = `${RNFS.DownloadDirectoryPath}/Wallet_Statement_${Date.now()}.pdf`;
      await RNFS.copyFile(filePath, destPath);
      return destPath;
    }

    // For iOS, the file is in the app's documents directory
    return filePath;
  } catch (error) {
    console.error('Download Statement Error:', error);
    throw error;
  }
};

export const shareWalletStatement = async (
  user: User | null,
  balance: number,
  transactions: Transaction[]
) => {
  try {
    const file = await generateStatementPDF(user, balance, transactions);

    if (!file.filePath) throw new Error("Failed to generate PDF");

    let fileUrl = file.filePath;

    if (Platform.OS === 'android') {
      try {
        // Base64 strings can exceed Android's Intent size limits, crashing the Share sheet.
        // Instead, we ensure the file is in the cache directory (which react-native-share's
        // FileProvider supports) and share it as a file:// URI.
        const cleanPath = file.filePath.replace(/^file:\/\//, '');
        const newPath = `${RNFS.CachesDirectoryPath}/Wallet_Statement_Share_${Date.now()}.pdf`;
        await RNFS.copyFile(cleanPath, newPath);
        fileUrl = `file://${newPath}`;
      } catch (e) {
        console.error("Failed to copy PDF for sharing:", e);
        if (!fileUrl.startsWith('file://')) {
          fileUrl = `file://${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
        }
      }
    } else {
      if (!fileUrl.startsWith('file://')) {
        fileUrl = `file://${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      }
    }

    await Share.open({
      url: fileUrl,
      title: 'Wallet Statement',
      subject: 'My VDrive Wallet Statement',
      type: 'application/pdf',
    });
    return true;
  } catch (error: any) {
    // Ignore share cancellation
    if (error.message && error.message.includes('User did not share')) {
      return false;
    }
    console.error('Share Statement Error:', error);
    throw error;
  }
};

export const generateTransactionReceiptHTML = (
  user: User | null,
  txn: Transaction
) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isCredit = Number(txn.amount) > 0;
  const amountColor = isCredit ? '#10B981' : '#EF4444';
  const formattedAmount = `${isCredit ? '+' : ''}₹${Math.abs(Number(txn.amount)).toLocaleString('en-IN')}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction Receipt</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 40px;
          background-color: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1E3A8A;
          margin: 0 0 10px 0;
        }
        .user-details {
          font-size: 14px;
          line-height: 1.6;
          color: #4B5563;
        }
        .amount-section {
          text-align: center;
          margin-bottom: 40px;
        }
        .amount-label {
          font-size: 14px;
          color: #64748B;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .amount-value {
          font-size: 42px;
          font-weight: bold;
          color: ${amountColor};
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 16px;
          border-bottom: 1px solid #E2E8F0;
          font-size: 15px;
        }
        th {
          text-align: left;
          color: #64748B;
          font-weight: 500;
          width: 40%;
        }
        td {
          color: #1E293B;
          font-weight: 600;
          text-align: right;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #94A3B8;
          border-top: 1px solid #E2E8F0;
          padding-top: 20px;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">Transaction Receipt</h1>
          <div class="user-details">
            <strong>${user?.full_name || 'User'}</strong><br>
            ${user?.email ? `${user.email}<br>` : ''}
            ${user?.phone_number ? `${user.phone_number}` : ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="color: #64748B; font-size: 14px;">Receipt Date</div>
          <div style="font-weight: 600; margin-top: 4px;">${currentDate}</div>
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-label">${txn.title || 'Wallet Transaction'}</div>
        <div class="amount-value">${formattedAmount}</div>
        <div style="margin-top: 10px; font-size: 16px; font-weight: 600; color: ${txn.status === 'SUCCESS' || txn.status === 'COMPLETED' ? '#10B981' : (txn.status === 'FAILED' ? '#EF4444' : '#F59E0B')}">
          ${txn.status}
        </div>
      </div>

      <table>
        <tbody>
          <tr>
            <th>Transaction ID</th>
            <td>${txn.id}</td>
          </tr>
          ${txn.rideId ? `
          <tr>
            <th>Ride ID</th>
            <td>${txn.rideId}</td>
          </tr>` : ''}
          <tr>
            <th>Date & Time</th>
            <td>${txn.date} ${txn.time}</td>
          </tr>
          <tr>
            <th>Transaction Type</th>
            <td>${(txn.type || '').replace(/_/g, ' ')}</td>
          </tr>
          ${txn.description ? `
          <tr>
            <th>Description</th>
            <td>${txn.description}</td>
          </tr>` : ''}
          ${txn.previousBalance !== undefined ? `
          <tr>
            <th>Previous Balance</th>
            <td>₹${Number(txn.previousBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
          ${txn.newBalance !== undefined ? `
          <tr>
            <th>New Balance</th>
            <td>₹${Number(txn.newBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <div class="footer">
        This is a computer-generated receipt. No signature is required.<br>
        VDrive Wallet Support
      </div>
    </body>
    </html>
  `;
};

export const downloadTransactionReceipt = async (
  user: User | null,
  txn: Transaction
) => {
  try {
    const html = generateTransactionReceiptHTML(user, txn);

    let options = {
      html: html,
      fileName: `Receipt_${txn.id}_${Date.now()}`,
      base64: true,
    };

    const file = await generatePDF(options);
    const filePath = file.filePath;

    if (!filePath) throw new Error("Failed to generate PDF path");

    if (Platform.OS === 'android') {
      const destPath = `${RNFS.DownloadDirectoryPath}/Receipt_${txn.id}.pdf`;
      await RNFS.copyFile(filePath, destPath);
      return destPath;
    }

    return filePath;
  } catch (error) {
    console.error('Download Receipt Error:', error);
    throw error;
  }
};
