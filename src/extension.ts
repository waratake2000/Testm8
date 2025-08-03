import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface TestCase {
    title: string;
    input: string;
    expected: string;
    tags?: string[];
    file: string;
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('testcases.open', async () => {
        const testcases = await loadTestcases();
        const panel = vscode.window.createWebviewPanel(
            'testcaseManager',
            'Testcase Manager',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, testcases);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

async function loadTestcases(): Promise<TestCase[]> {
    const result: TestCase[] = [];
    const files = await vscode.workspace.findFiles('testcases/*.yml');
    for (const uri of files) {
        try {
            const content = await fs.promises.readFile(uri.fsPath, 'utf8');
            const data = yaml.load(content);
            if (Array.isArray(data)) {
                for (const item of data) {
                    result.push({
                        title: String(item.title ?? ''),
                        input: String(item.input ?? ''),
                        expected: String(item.expected ?? ''),
                        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
                        file: path.basename(uri.fsPath)
                    });
                }
            } else if (data && typeof data === 'object') {
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
            console.error('Failed to load', uri.fsPath, err);
        }
    }
    return result;
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, testcases: TestCase[]): string {
    const rows = testcases.map(tc => `
        <tr>
            <td>${escapeHtml(tc.title)}</td>
            <td>${escapeHtml(tc.input)}</td>
            <td>${escapeHtml(tc.expected)}</td>
            <td>${escapeHtml(tc.tags?.join(', ') ?? '')}</td>
            <td>${escapeHtml(tc.file)}</td>
        </tr>`).join('\n');

    return /* html */`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { cursor: pointer; }
            #filter { margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <input type="text" id="filter" placeholder="Filter by title..." />
        <table id="table">
            <thead>
                <tr>
                    <th data-col="0">Title</th>
                    <th data-col="1">Input</th>
                    <th data-col="2">Expected</th>
                    <th data-col="3">Tags</th>
                    <th data-col="4">File</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <script>
            const table = document.getElementById('table');
            document.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
                const col = parseInt(th.getAttribute('data-col'));
                const rows = Array.from(table.tBodies[0].rows);
                const asc = th.classList.toggle('asc');
                rows.sort((a,b) => a.cells[col].textContent.localeCompare(b.cells[col].textContent));
                if (!asc) rows.reverse();
                rows.forEach(r => table.tBodies[0].appendChild(r));
            }));
            document.getElementById('filter').addEventListener('input', e => {
                const val = e.target.value.toLowerCase();
                Array.from(table.tBodies[0].rows).forEach(r => {
                    r.style.display = r.cells[0].textContent.toLowerCase().includes(val) ? '' : 'none';
                });
            });
        </script>
    </body>
    </html>`;
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
