import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DemoPatternsService } from '../../patterns/creational/demo/demo-patterns.service';

async function runDemo() {
  console.log('🚀 Iniciando aplicación para ejecutar demo...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const demoService = app.get(DemoPatternsService);

    console.log('📝 Ejecutando demostración de patrones creacionales...\n');
    await demoService.demostrarPatroneCreacionales();

    console.log('\n✅ Demo ejecutada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando demo:', error);
  } finally {
    await app.close();
  }
}

runDemo();
