import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

@Injectable()
export class DastService {
  private readonly reportsDir = join(process.cwd(), 'dast-reports');

  constructor() {
    // Создаем директорию для отчетов
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Запуск OWASP ZAP для сканирования
  async runZapScan(targetUrl: string) {
    try {
      const reportPath = join(this.reportsDir, `zap-report-${Date.now()}.json`);
      
      const command = `
        zap-baseline.py \
          -t ${targetUrl} \
          -J ${reportPath} \
          -c zap-context \
          -u zap-user \
          -r zap-report.html \
          --hook=/zap/hook.js
      `;

      const { stdout, stderr } = await execAsync(command);
      
      return {
        success: true,
        reportPath,
        output: stdout,
        errors: stderr,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Запуск SQLMap для обнаружения SQL инъекций
  async runSQLMapScan(targetUrl: string) {
    try {
      const reportPath = join(this.reportsDir, `sqlmap-report-${Date.now()}`);
      
      const command = `
        sqlmap -u "${targetUrl}" \
          --batch \
          --output-dir=${reportPath} \
          --level=5 \
          --risk=3 \
          --forms \
          --crawl=2
      `;

      const { stdout, stderr } = await execAsync(command);
      
      return {
        success: true,
        reportPath,
        output: stdout,
        errors: stderr,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Запуск Nuclei для сканирования уязвимостей
  async runNucleiScan(targetUrl: string) {
    try {
      const reportPath = join(this.reportsDir, `nuclei-report-${Date.now()}.json`);
      
      const command = `
        nuclei -target ${targetUrl} \
          -json -o ${reportPath} \
          -t /nuclei-templates/ \
          -severity critical,high,medium
      `;

      const { stdout, stderr } = await execAsync(command);
      
      return {
        success: true,
        reportPath,
        output: stdout,
        errors: stderr,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Анализ зависимостей на уязвимости
  async runDependencyCheck() {
    try {
      const reportPath = join(this.reportsDir, `dependency-check-${Date.now()}.json`);
      
      const command = `
        dependency-check \
          --project "Streaming Platform" \
          --scan ./ \
          --format JSON \
          --out ${reportPath} \
          --enableExperimental
      `;

      const { stdout, stderr } = await execAsync(command);
      
      return {
        success: true,
        reportPath,
        output: stdout,
        errors: stderr,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Получение последнего отчета
  getLatestReport(tool: string) {
    const reports = fs.readdirSync(this.reportsDir)
      .filter(file => file.startsWith(tool))
      .sort()
      .reverse();

    if (reports.length === 0) {
      return null;
    }

    const latestReport = reports[0];
    const reportPath = join(this.reportsDir, latestReport);
    
    try {
      const content = fs.readFileSync(reportPath, 'utf8');
      return {
        path: reportPath,
        content: JSON.parse(content),
      };
    } catch (error) {
      return null;
    }
  }
}