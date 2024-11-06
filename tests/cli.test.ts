import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { test, expect } from 'vitest';
import { clean } from './utils';

test('CLI convert single file', async () => {
	const filePath = path.resolve(__dirname, 'test.vue');
	const outputPath = path.resolve(__dirname, 'output.vue');

	await fs.writeFile(
		filePath,
		`
 <script lang="ts">
import { Component } from 'common/vue';

@Component
export default class LanguageSelector extends Vue {}
</script>
  `,
		'utf-8',
	);

	await execa('./dist/cli.js', ['single', filePath]);

	const result = fs.readFileSync(filePath, 'utf-8');

	const expectedCode = `<script lang="ts"> export default defineComponent({ name: 'LanguageSelector', }); </script> `;

	expect(clean(result)).toEqual(clean(expectedCode));

	// Чистим файлы после теста
	await fs.remove(filePath);
	await fs.remove(outputPath);
});

test('CLI convert all files in folder', async () => {
	const folderPath = path.resolve(__dirname, 'test-folder');
	await fs.ensureDir(folderPath);

	await fs.writeFile(
		path.join(folderPath, 'file1.vue'),
		` <script lang="ts"> import { Component } from 'common/vue'; @Component export default class LanguageSelector extends Vue {} </script> `,
	);

	await fs.writeFile(
		path.join(folderPath, 'file2.vue'),
		`<script lang="ts"> import { Component } from 'common/vue'; @Component export default class LanguageSelector extends Vue {} </script>`,
	);

	// Запускаем CLI
	await execa('./dist/cli.js', ['folder', folderPath]);

	const result1 = await fs.readFile(path.join(folderPath, 'file1.vue'), 'utf-8');
	const result2 = await fs.readFile(path.join(folderPath, 'file2.vue'), 'utf-8');

	const expectedCode1 = `<script lang="ts"> export default defineComponent({ name: 'LanguageSelector', }); </script> `;

	const expectedCode2 = `<script lang="ts"> export default defineComponent({ name: 'LanguageSelector', }); </script>`;

	expect(clean(result1)).toEqual(clean(expectedCode1));
	expect(clean(result2)).toEqual(clean(expectedCode2));

	// Удаляем директорию после теста
	await fs.remove(folderPath);
});
