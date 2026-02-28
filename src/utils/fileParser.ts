import * as XLSX from "xlsx";
import { extractInstagramUsername } from "~utils/instagramUsernameUtils";

/**
 * 解析上传的 CSV 或 Excel 文件并提取 Instagram 用户名列表。
 *
 * 用途：
 * - 在 CreateTask 中真实解析用户上传的文件。
 * - 自动提取第一列（或包含 'user' 关键字的列）中的用户名。
 * - 对用户名进行清洗（去空格、去前缀 @）并去重。
 *
 * 参数：
 * - file：File；用户上传的文件对象。
 *
 * 返回值：
 * - Promise<string[]>；去重后的有效用户名数组。
 *
 * 异常：
 * - 文件读取或解析失败时抛出错误。
 */
export async function parseInstagramUsersFromFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 转换为 JSON 二维数组以便处理
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const usernames = new Set<string>();
        
        // 遍历行，寻找可能的用户名列
        // 策略：如果第一行包含 'user' 或 'username' 关键字，记录该索引；否则默认取第一列。
        let targetColIndex = 0;
        if (rawRows.length > 0) {
          const headerRow = rawRows[0].map(v => String(v || '').toLowerCase());
          const index = headerRow.findIndex(v => v.includes('user'));
          if (index !== -1) {
            targetColIndex = index;
          }
        }

        // 从第二行（或第一行，取决于是否有表头）开始提取
        rawRows.forEach((row, rowIndex) => {
          // 如果第一行看起来像表头（包含关键字），则跳过第一行
          if (rowIndex === 0 && row[targetColIndex] && String(row[targetColIndex]).toLowerCase().includes('user')) {
            return;
          }

          const rawValue = row[targetColIndex];
          if (rawValue) {
            const username = extractInstagramUsername(rawValue);
            if (username) {
              usernames.add(username);
            }
          }
        });

        resolve(Array.from(usernames));
      } catch (err) {
        console.error("File parse error:", err);
        reject(new Error("Failed to parse file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("File read error"));
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}
