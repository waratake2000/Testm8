/**
 * Testm8 Extension
 * 
 * この拡張機能は、ワークスペース内のYAMLテストケースファイルを読み込み、
 * 美しいUIでテーブル表示するVS Code/Cursor用の拡張機能です。
 * 
 * 機能:
 * - YAMLファイルの自動検出と読み込み
 * - 美しいテーブルUIでの表示
 * - 検索・ソート・フィルタリング機能
 * - レスポンシブデザイン
 * 
 * @author Testm8 Team
 * @version 1.0.0
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * テストケースのインターフェース定義
 * 
 * YAMLファイルから読み込まれるテストケースの構造を定義します。
 * 各テストケースはタイトル、入力、期待値、タグ、ファイル名を持ちます。
 */
interface TestCase {
    /** テストケースのタイトル */
    title: string;
    /** テストの入力値 */
    input: string;
    /** 期待される出力値 */
    expected: string;
    /** テストケースのタグ（オプション） */
    tags?: string[];
    /** テストケースが含まれるファイル名 */
    file: string;
}

/**
 * 拡張機能のアクティベーション関数
 * 
 * 拡張機能が有効化されたときに呼び出されます。
 * コマンドの登録とイベントリスナーの設定を行います。
 * 
 * @param context 拡張機能のコンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
    // 'testcases.open'コマンドを登録
    // このコマンドはコマンドパレットから実行可能
    const disposable = vscode.commands.registerCommand('testcases.open', async () => {
        // テストケースを読み込み
        const testcases = await loadTestcases();
        
        // WebViewパネルを作成
        // これにより、美しいUIを表示するためのWebページが作成される
        const panel = vscode.window.createWebviewPanel(
            'testm8',                 // パネルの識別子
            'Testm8',                 // パネルのタイトル
            vscode.ViewColumn.One,    // 表示する列（最初の列）
            { enableScripts: true }   // JavaScriptを有効化（インタラクティブ機能のため）
        );
        
        // WebViewにHTMLコンテンツを設定
        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, testcases);
    });

    // 拡張機能のクリーンアップ時に実行される処理を登録
    context.subscriptions.push(disposable);
}

/**
 * 拡張機能の非アクティベーション関数
 * 
 * 拡張機能が無効化されたときに呼び出されます。
 * 現在は特別なクリーンアップ処理は不要です。
 */
export function deactivate() {}

/**
 * テストケースファイルを読み込む関数
 * 
 * ワークスペース内のtestcasesディレクトリからYAMLファイルを検索し、
 * 各ファイルのテストケースを読み込んでTestCaseオブジェクトの配列を返します。
 * 
 * @returns Promise<TestCase[]> 読み込まれたテストケースの配列
 */
async function loadTestcases(): Promise<TestCase[]> {
    const result: TestCase[] = [];
    
    // ワークスペースのルートフォルダを取得
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        console.error('No workspace folder found');
        return result;
    }
    
    // testcasesディレクトリ内のYAMLファイルを検索
    // **/testcases/*.yml パターンで、サブディレクトリも含めて検索
    const files = await vscode.workspace.findFiles('**/testcases/*.yml');
    
    // デバッグ用ログ出力
    console.log('Workspace root:', workspaceFolder.uri.fsPath);
    console.log('Found files:', files.map(f => f.fsPath));
    
    // 各YAMLファイルを処理
    for (const uri of files) {
        try {
            // ファイルの内容をUTF-8で読み込み
            const content = await fs.promises.readFile(uri.fsPath, 'utf8');
            
            // YAMLをパース
            const data = yaml.load(content);
            
            // データが配列の場合（複数のテストケース）
            if (Array.isArray(data)) {
                for (const item of data) {
                    result.push({
                        title: String(item.title ?? ''),                    // タイトル（デフォルト: 空文字）
                        input: String(item.input ?? ''),                    // 入力（デフォルト: 空文字）
                        expected: String(item.expected ?? ''),              // 期待値（デフォルト: 空文字）
                        tags: Array.isArray(item.tags) ? item.tags.map(String) : [], // タグ（デフォルト: 空配列）
                        file: path.basename(uri.fsPath)                     // ファイル名
                    });
                }
            } 
            // データがオブジェクトの場合（単一のテストケース）
            else if (data && typeof data === 'object') {
                const item: any = data;
                result.push({
                    title: String(item.title ?? ''),
                    input: String(item.input ?? ''),
                    expected: String(item.expected ?? ''),
                    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
                    file: path.basename(uri.fsPath)
                });
            }
        } catch (err) {
            // ファイル読み込みエラーのログ出力
            console.error('Failed to load', uri.fsPath, err);
        }
    }
    
    return result;
}

/**
 * WebViewのHTMLコンテンツを生成する関数
 * 
 * テストケースのデータを受け取り、美しいUIを持つHTMLを生成します。
 * モダンなデザイン、レスポンシブレイアウト、インタラクティブ機能を含みます。
 * 
 * @param webview WebViewオブジェクト
 * @param extensionUri 拡張機能のURI
 * @param testcases 表示するテストケースの配列
 * @returns 生成されたHTML文字列
 */
function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, testcases: TestCase[]): string {
    // テストケースのデータをHTMLテーブル行に変換
    const rows = testcases.map(tc => `
        <tr class="testcase-row">
            <td class="title-cell">
                <div class="title-content">
                    <span class="title-text">${escapeHtml(tc.title)}</span>
                    <div class="file-badge">${escapeHtml(tc.file)}</div>
                </div>
            </td>
            <td class="input-cell">
                <code class="code-block">${escapeHtml(tc.input)}</code>
            </td>
            <td class="expected-cell">
                <code class="code-block">${escapeHtml(tc.expected)}</code>
            </td>
            <td class="tags-cell">
                ${tc.tags?.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('') || '<span class="no-tags">No tags</span>'}
            </td>
        </tr>`).join('\n');

    // HTMLテンプレートを生成
    // VS Codeのテーマに合わせた美しいUIを構築
    return /* html */`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- 
            CSSスタイル定義
            VS Codeのテーマ変数を使用して、ダーク/ライトテーマに対応
            レスポンシブデザインとモダンなUIを実現
        -->
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                background: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                padding: 20px;
                line-height: 1.6;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            .header h1 {
                font-size: 24px;
                font-weight: 600;
                color: var(--vscode-editor-foreground);
            }

            .stats {
                display: flex;
                gap: 16px;
                font-size: 14px;
                color: var(--vscode-descriptionForeground);
            }

            .search-container {
                position: relative;
                margin-bottom: 20px;
            }

            .search-input {
                width: 100%;
                max-width: 400px;
                padding: 12px 16px;
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                font-size: 14px;
                transition: border-color 0.2s ease;
            }

            .search-input:focus {
                outline: none;
                border-color: var(--vscode-focusBorder);
                box-shadow: 0 0 0 2px var(--vscode-focusBorder);
            }

            .search-input::placeholder {
                color: var(--vscode-input-placeholderForeground);
            }

            .table-container {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }

            th {
                background: var(--vscode-panel-background);
                color: var(--vscode-panel-foreground);
                padding: 16px 12px;
                text-align: left;
                font-weight: 600;
                cursor: pointer;
                user-select: none;
                transition: background-color 0.2s ease;
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            th:hover {
                background: var(--vscode-panel-hoverBackground);
            }

            th.sortable::after {
                content: '↕';
                margin-left: 8px;
                opacity: 0.5;
                transition: opacity 0.2s ease;
            }

            th.sortable:hover::after {
                opacity: 1;
            }

            th.asc::after {
                content: '↑';
                opacity: 1;
            }

            th.desc::after {
                content: '↓';
                opacity: 1;
            }

            td {
                padding: 16px 12px;
                border-bottom: 1px solid var(--vscode-panel-border);
                vertical-align: top;
            }

            tr:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .title-cell {
                width: 25%;
            }

            .title-content {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .title-text {
                font-weight: 500;
                color: var(--vscode-editor-foreground);
            }

            .file-badge {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                background: var(--vscode-badge-background);
                padding: 2px 6px;
                border-radius: 4px;
                display: inline-block;
                width: fit-content;
            }

            .input-cell, .expected-cell {
                width: 25%;
            }

            .code-block {
                background: var(--vscode-textCodeBlock-background);
                padding: 8px 12px;
                border-radius: 4px;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-size: 13px;
                color: var(--vscode-textCodeBlock-foreground);
                display: block;
                white-space: pre-wrap;
                word-break: break-word;
                border: 1px solid var(--vscode-textCodeBlock-border);
            }

            .tags-cell {
                width: 25%;
            }

            .tag {
                display: inline-block;
                background: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                margin: 2px 4px 2px 0;
                font-weight: 500;
            }

            .no-tags {
                color: var(--vscode-descriptionForeground);
                font-style: italic;
                font-size: 12px;
            }

            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: var(--vscode-descriptionForeground);
            }

            .empty-state h3 {
                margin-bottom: 8px;
                color: var(--vscode-editor-foreground);
            }

            .empty-state p {
                font-size: 14px;
            }

            .loading {
                text-align: center;
                padding: 40px;
                color: var(--vscode-descriptionForeground);
            }

            @media (max-width: 768px) {
                body {
                    padding: 12px;
                }
                
                .header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .stats {
                    gap: 8px;
                }
                
                table {
                    font-size: 12px;
                }
                
                th, td {
                    padding: 12px 8px;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧪 Testm8</h1>
            <div class="stats">
                <span>📁 ${testcases.length} testcases</span>
                <span>🏷️ ${testcases.reduce((sum, tc) => sum + (tc.tags?.length || 0), 0)} tags</span>
            </div>
        </div>

        <div class="search-container">
            <input type="text" id="filter" class="search-input" placeholder="🔍 Search testcases by title..." />
        </div>

        <div class="table-container">
            ${testcases.length > 0 ? `
            <table id="table">
                <thead>
                    <tr>
                        <th class="sortable" data-col="0">Title</th>
                        <th class="sortable" data-col="1">Input</th>
                        <th class="sortable" data-col="2">Expected</th>
                        <th class="sortable" data-col="3">Tags</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            ` : `
            <div class="empty-state">
                <h3>📝 No testcases found</h3>
                <p>Create YAML files in the <code>testcases/</code> directory to get started.</p>
            </div>
            `}
        </div>

        <!-- 
            JavaScript機能
            ソート機能、フィルタリング機能、リアルタイム統計更新を実装
        -->
        <script>
            const table = document.getElementById('table');
            const filter = document.getElementById('filter');
            let currentSort = { col: -1, asc: true };

            if (table) {
                // ソート機能の実装
                // 各列ヘッダーをクリックしてソート可能
                document.querySelectorAll('th.sortable').forEach(th => {
                    th.addEventListener('click', () => {
                        const col = parseInt(th.getAttribute('data-col'));
                        const rows = Array.from(table.tBodies[0].rows);
                        
                        // ソートインジケーターを更新
                        document.querySelectorAll('th').forEach(header => {
                            header.classList.remove('asc', 'desc');
                        });
                        
                        // ソート方向を切り替え（同じ列をクリックした場合）
                        if (currentSort.col === col) {
                            currentSort.asc = !currentSort.asc;
                        } else {
                            currentSort.col = col;
                            currentSort.asc = true;
                        }
                        
                        // ソートインジケーターを表示
                        th.classList.add(currentSort.asc ? 'asc' : 'desc');
                        
                        // 行をソート
                        rows.sort((a, b) => {
                            const aText = a.cells[col].textContent.trim();
                            const bText = b.cells[col].textContent.trim();
                            return aText.localeCompare(bText);
                        });
                        
                        // 降順の場合は配列を反転
                        if (!currentSort.asc) {
                            rows.reverse();
                        }
                        
                        // ソートされた行をテーブルに再配置
                        rows.forEach(r => table.tBodies[0].appendChild(r));
                    });
                });

                // フィルタリング機能の実装
                // 検索ボックスの入力に応じてリアルタイムでフィルタリング
                filter.addEventListener('input', (e) => {
                    const val = e.target.value.toLowerCase();
                    const rows = Array.from(table.tBodies[0].rows);
                    
                    // 各行をフィルタリング
                    rows.forEach(r => {
                        const title = r.cells[0].textContent.toLowerCase();
                        const input = r.cells[1].textContent.toLowerCase();
                        const expected = r.cells[2].textContent.toLowerCase();
                        const tags = r.cells[3].textContent.toLowerCase();
                        
                        // タイトル、入力、期待値、タグのいずれかに検索語が含まれるかチェック
                        const matches = title.includes(val) || 
                                      input.includes(val) || 
                                      expected.includes(val) || 
                                      tags.includes(val);
                        
                        // マッチする行のみ表示
                        r.style.display = matches ? '' : 'none';
                    });
                    
                    // 統計情報をリアルタイム更新
                    const visibleRows = rows.filter(r => r.style.display !== 'none');
                    const stats = document.querySelector('.stats');
                    if (stats) {
                        stats.innerHTML = \`
                            <span>📁 \${visibleRows.length} testcases</span>
                            <span>🏷️ \${visibleRows.reduce((sum, r) => {
                                const tagText = r.cells[3].textContent;
                                return sum + (tagText.includes('No tags') ? 0 : tagText.split(',').length);
                            }, 0)} tags</span>
                        \`;
                    }
                });
            }
        </script>
    </body>
    </html>`;
}

/**
 * HTMLエスケープ関数
 * 
 * ユーザー入力のHTMLインジェクション攻撃を防ぐため、
 * 危険な文字をHTMLエンティティに変換します。
 * 
 * @param unsafe エスケープする文字列
 * @returns エスケープされた安全な文字列
 */
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')   // & を &amp; に変換
        .replace(/</g, '&lt;')     // < を &lt; に変換
        .replace(/>/g, '&gt;')     // > を &gt; に変換
        .replace(/"/g, '&quot;')   // " を &quot; に変換
        .replace(/'/g, '&#39;');   // ' を &#39; に変換
}
