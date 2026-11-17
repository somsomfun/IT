import express, { Request, Response } from 'express';
import path from 'path';
import { pool } from './db';

const app = express(); // Expressアプリケーションを作成
const port: number = 3000; // ローカルで使用するポート番号

// ------------------------------
// Expressの基本設定
// ------------------------------
app.use(express.urlencoded({ extended: true })); // フォームから送信されたデータを受け取れるようにする
app.use(express.static(path.join(process.cwd(), 'public'))); // CSSや画像などの静的ファイルを公開する
app.set('view engine', 'ejs'); // テンプレートエンジンにEJSを設定
app.set('views', path.join(process.cwd(), 'views')); // EJSファイルを保存するフォルダーを指定

// ------------------------------
// ルーティング
// ------------------------------

// 「/」にアクセスされたときの処理
app.get('/', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

// 「/api/db-check」にアクセスされたときの処理（Neon接続確認用）
app.get('/api/db-check', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT 1 AS connection_test');
    res.json({
      status: 'ok',
      database: result.rows[0].connection_test === 1 ? 'connected' : 'error',
    });
  } catch (error) {
    console.error('DB接続確認に失敗しました', error);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// 「/db-sample」にアクセスされたときの処理（商品一覧表示用）
app.get('/db-sample', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, price FROM products ORDER BY id ASC');
    res.render('db-sample', { products: result.rows });
  } catch (error) {
    console.error('商品一覧の取得に失敗しました', error);
    res.status(500).send('データベースエラーが発生しました');
  }
});

// ------------------------------
// サーバー起動
// ------------------------------

app.listen(port, (): void => {
  console.log(`Server started: http://localhost:${port}`);
});