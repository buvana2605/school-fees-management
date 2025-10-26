document.addEventListener('DOMContentLoaded', function () {
    // Fees Management
    const feeForm = document.getElementById('feeForm');
    if (feeForm) {
        feeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const studentId = document.getElementById('studentId').value;
            const amount = document.getElementById('amount').value;
            const paymentDate = document.getElementById('paymentDate').value;
            const paymentMode = document.getElementById('paymentMode').value;
            const remarks = document.getElementById('remarks').value || 'N/A';

            // Get student name from students array
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const student = students.find(s => s.roll === studentId);
            
            if (!student) {
                document.getElementById('feeMessage').textContent = 'Student Roll Number not found!';
                document.getElementById('feeMessage').style.color = 'red';
                setTimeout(() => {
                    document.getElementById('feeMessage').textContent = '';
                }, 3000);
                return;
            }

            const feePayment = {
                studentId,
                studentName: student.name,
                studentClass: student.class,
                amount,
                date: paymentDate,
                paymentMode,
                remarks,
                status: 'Paid',
                timestamp: new Date().toISOString()
            };

            let feePayments = JSON.parse(localStorage.getItem('feePayments') || '[]');
            feePayments.push(feePayment);
            localStorage.setItem('feePayments', JSON.stringify(feePayments));

            document.getElementById('feeMessage').textContent = 'Payment recorded successfully!';
            document.getElementById('feeMessage').style.color = 'green';
            setTimeout(() => {
                document.getElementById('feeMessage').textContent = '';
            }, 3000);
            
            feeForm.reset();
            // Reset date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('paymentDate').value = today;
            
            updateFeesTable();
        });
    }

    // Update Fees Table
    const feesTable = document.getElementById('feesTable');
    if (feesTable) {
        updateFeesTable();
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username === "admin" && password === "admin123") {
                window.location.href = "login_redirect.html";
            } else {
                document.getElementById('loginMessage').textContent = "Invalid credentials!";
            }
        });
    }

    const form = document.getElementById('studentForm');
    if (form) {
        const editData = localStorage.getItem('editStudentData');
        if (editData) {
            const student = JSON.parse(editData);
            document.getElementById('name').value = student.name;
            document.getElementById('roll').value = student.roll;
            document.getElementById('class').value = student.class;
            document.getElementById('marks').value = student.marks;
            localStorage.removeItem('editStudentData');
        }
        const idx = localStorage.getItem('editStudentIdx');
        if (idx !== null) {
            form.onsubmit = function (e) {
                e.preventDefault();
                let students = JSON.parse(localStorage.getItem('students') || '[]');
                students[idx] = {
                    name: document.getElementById('name').value,
                    roll: document.getElementById('roll').value,
                    class: document.getElementById('class').value,
                    marks: document.getElementById('marks').value
                };
                localStorage.setItem('students', JSON.stringify(students));
                localStorage.removeItem('editStudentIdx');
                document.getElementById('message').textContent = "Student updated successfully!";
                setTimeout(() => {
                    document.getElementById('message').textContent = "";
                }, 2000);
                form.reset();
            };
        } else {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const roll = document.getElementById('roll').value;
                const studentClass = document.getElementById('class').value;
                const marks = document.getElementById('marks').value;

                const student = { name, roll, class: studentClass, marks };
                let students = JSON.parse(localStorage.getItem('students') || '[]');
                students.push(student);
                localStorage.setItem('students', JSON.stringify(students));

                document.getElementById('message').textContent = "Student added successfully!";
                setTimeout(() => {
                    document.getElementById('message').textContent = "";
                }, 2000);
                form.reset();
            });
        }
    }

    const table = document.getElementById('studentsTable');
    if (table) {
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        students.forEach((student, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.roll}</td>
                <td>${student.class}</td>
                <td>${student.marks}</td>
                <td>
                    <button onclick="editStudent(${idx})">Edit</button>
                    <button onclick="deleteStudent(${idx})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
});

function deleteStudent(idx) {
    let students = JSON.parse(localStorage.getItem('students') || '[]');
    students.splice(idx, 1);
    localStorage.setItem('students', JSON.stringify(students));
    document.getElementById('feedback').textContent = "Student deleted successfully!";
    setTimeout(() => {
        document.getElementById('feedback').textContent = "";
        location.reload();
    }, 1000);
}

function editStudent(idx) {
    let students = JSON.parse(localStorage.getItem('students') || '[]');
    const student = students[idx];
    localStorage.setItem('editStudentIdx', idx);
    localStorage.setItem('editStudentData', JSON.stringify(student));
    window.location.href = 'add_student.html';
}

function deleteFeeRecord(idx) {
    if (confirm('Are you sure you want to delete this fee record?')) {
        let feePayments = JSON.parse(localStorage.getItem('feePayments') || '[]');
        feePayments.splice(idx, 1);
        localStorage.setItem('feePayments', JSON.stringify(feePayments));
        
        const feedback = document.getElementById('feedback');
        if (feedback) {
            feedback.textContent = "Fee record deleted successfully!";
            feedback.style.color = 'green';
            setTimeout(() => {
                feedback.textContent = "";
            }, 2000);
        }
        
        updateFeesTable();
    }
}

function updateFeesTable() {
    const feesTableBody = document.getElementById('feesTableBody');
    if (feesTableBody) {
        const feePayments = JSON.parse(localStorage.getItem('feePayments') || '[]');
        feesTableBody.innerHTML = '';
        
        if (feePayments.length === 0) {
            feesTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No fee records found</td></tr>';
            return;
        }
        
        // Sort by date (newest first)
        feePayments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        feePayments.forEach((payment, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.studentId}</td>
                <td>${payment.studentName}</td>
                <td>${payment.studentClass || 'N/A'}</td>
                <td>₹${parseFloat(payment.amount).toLocaleString('en-IN')}</td>
                <td>${new Date(payment.date).toLocaleDateString('en-IN')}</td>
                <td>${payment.paymentMode}</td>
                <td>${payment.remarks || 'N/A'}</td>
                <td><span style="color: green; font-weight: bold;">${payment.status}</span></td>
                <td>
                    <button onclick="deleteFeeRecord(${idx})" style="background: #dc3545;">Delete</button>
                </td>
            `;
            feesTableBody.appendChild(row);
        });
    }   
}