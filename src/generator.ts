import { planWind } from './planner/planner';
import * as fs from 'fs';

export function generateGcodeFromWindObject(windDefinition: object, verbose = false): string[] {
  return planWind(windDefinition as any, verbose);
}

export function generateAndSaveGcode(windPath: string, outputPath: string, verbose = false): void {
  const fileContents = fs.readFileSync(windPath, 'utf-8');
  const windDefinition = JSON.parse(fileContents);
  const gcode = planWind(windDefinition, verbose);
  fs.writeFileSync(outputPath, gcode.join('\n'));
}