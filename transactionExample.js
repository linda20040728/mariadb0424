const pool = require('./db');
 
async function doTransaction() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction(); // 開始交易
 
        const studentId = 'S10721002';
        const newDepartmentId = 'BA001';
 
        // 檢查學號是否存在，並直接獲取學生資料
        const checkQuery = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
        const result = await conn.query(checkQuery, [studentId]);
        if (!result || result.length === 0) {
            console.error(`學號 ${studentId} 不存在，無法進行轉系操作`);
        }
 
        // 更新學生系別
        const updateStudent = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
        await conn.query(updateStudent, [newDepartmentId, studentId]);
 
        // 提交交易
        await conn.commit();
        console.log('交易成功，已提交');
 
        // 查詢該學生當前系別
        const updatedResult = await conn.query(checkQuery, [studentId]);
        const updatedStudent = updatedResult[0];
 
        console.log(`學生 ${studentId} 目前的系別是: ${updatedStudent.Department_ID}`);
    } catch (err) {
        // 若有任何錯誤，回滾所有操作
        if (conn) await conn.rollback();
        console.error('交易失敗，已回滾：', err);
    } finally {
        if (conn) conn.release();
    }
}
 
doTransaction();