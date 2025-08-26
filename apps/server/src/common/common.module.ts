import { Module } from '@nestjs/common';
import { MonitoringService } from './services/monitoring.service';
import { LoggingService } from './services/logging.service';
import { DastService } from './services/dast.service';
import { SqlFirewallService } from './services/sql-firewall.service';
import { SignedSqlService } from './services/signed-sql.service';
import { HsmService } from './services/hsm-service';
import { SecretRotationService } from './services/secret-rotation.service';
import { MetricsController } from './controllers/metrics.controller';
import { LogsController } from './controllers/logs.controller';
import { LogsGateway } from './gateways/logs.gateway';

@Module({
  controllers: [MetricsController, LogsController],
  providers: [
    MonitoringService,
    LoggingService,
    DastService,
    SqlFirewallService,
    SignedSqlService,
    HsmService,
    SecretRotationService,
    LogsGateway,
  ],
  exports: [
    MonitoringService,
    LoggingService,
    DastService,
    SqlFirewallService,
    SignedSqlService,
    HsmService,
    SecretRotationService,
  ],
})
export class CommonModule {}