const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5001;
const DATA_FILE = path.join(__dirname, "shoppingList.json");

// 미들웨어 설정
app.use(
  cors({
    origin:
      "https://shopping-list-client-1wyzsyyxg-mchoi2000s-projects.vercel.app",
    credentials: true,
  })
);
app.use(bodyParser.json());

// 초기 데이터 파일이 없으면 생성
const initDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [] }), "utf8");
  }
};

// 데이터 파일 읽기
const readDataFile = () => {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
};

// 데이터 파일 쓰기
const writeDataFile = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
};

// 초기화
initDataFile();

// 모든 쇼핑 아이템 가져오기
app.get("/api/items", (req, res) => {
  try {
    const data = readDataFile();
    res.json(data.items);
  } catch (error) {
    res
      .status(500)
      .json({ error: "데이터를 불러오는 중 오류가 발생했습니다." });
  }
});

// 새 쇼핑 아이템 추가
app.post("/api/items", (req, res) => {
  try {
    const { name, quantity, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: "이름은 필수 항목입니다." });
    }

    const data = readDataFile();
    const newItem = {
      id: Date.now().toString(),
      name,
      quantity: quantity || 1,
      category: category || "기타",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    data.items.push(newItem);
    writeDataFile(data);

    res.status(201).json(newItem);
  } catch (error) {
    res
      .status(500)
      .json({ error: "아이템을 추가하는 중 오류가 발생했습니다." });
  }
});

// 쇼핑 아이템 업데이트
app.put("/api/items/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const data = readDataFile();
    const itemIndex = data.items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "아이템을 찾을 수 없습니다." });
    }

    data.items[itemIndex] = { ...data.items[itemIndex], ...updates };
    writeDataFile(data);

    res.json(data.items[itemIndex]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "아이템을 업데이트하는 중 오류가 발생했습니다." });
  }
});

// 쇼핑 아이템 삭제
app.delete("/api/items/:id", (req, res) => {
  try {
    const { id } = req.params;

    const data = readDataFile();
    const itemIndex = data.items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "아이템을 찾을 수 없습니다." });
    }

    data.items.splice(itemIndex, 1);
    writeDataFile(data);

    res.json({ message: "아이템이 삭제되었습니다." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "아이템을 삭제하는 중 오류가 발생했습니다." });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
