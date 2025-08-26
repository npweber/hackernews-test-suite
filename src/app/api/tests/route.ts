import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { Test } from '@/types/test';
import { safeJsonParse, safeJsonStringify } from '@/app/util/util';

// GET /api/tests: Get all tests from the tests directory
export async function GET() : Promise<NextResponse<{ tests: Test[] } | { error: string }>> {
    let response: NextResponse<{ tests: Test[] } | { error: string }>;
    const tests: Test[] = [];

    try {
        console.log('GET /api/tests: Reading tests directory...');
        const testsDir: string = path.join(process.cwd(), 'src/hackernews-tests');
        const testsDirFiles: fs.Dirent[] = fs.readdirSync(testsDir, {
            encoding: 'utf8',
            withFileTypes: true
        });

        if (testsDirFiles.length > 0) {
            testsDirFiles.forEach((file: fs.Dirent) => {
                if (file.isFile() && file.name.endsWith('.json')) {
                    console.log(`GET /api/tests: Found test file: ${file.name}. Parsing...`);
                    const testData: Test = safeJsonParse(fs.readFileSync(path.join(testsDir, file.name), 'utf8'));
                    console.log(`GET /api/tests: Test file parsed: ${file.name}. Adding to tests array...`);
                    tests.push(testData);
                }
            });
        }
        console.log(`GET /api/tests: Returning ${tests.length} tests.`);
        response = NextResponse.json({ tests: tests }, { status: 200 });
    } catch (error) {
        response = NextResponse.json({ error: `Failed to read tests directory: ${error}` }, { status: 500 });
    }
    return response;
}

// PUT /api/tests: Update a test by name
export async function PUT(request: NextRequest) : Promise<NextResponse<{ message: string } | { error: string }>> {
    let response: NextResponse<{ message: string } | { error: string }>;
    if (!request.body) {
        response = NextResponse.json({ error: 'No body provided' }, { status: 400 });
    }
    else {
        const { test } : { test: Test } = await request.json();
        if (!test) {
            response = NextResponse.json({ error: 'No test provided' }, { status: 400 });
        }
        else {
            if (!test.name) {
                response = NextResponse.json({ error: 'No test name provided' }, { status: 400 });
            }
            else {
                const testFile: string = path.join(process.cwd(), 'src/hackernews-tests', test.name.concat('.json'));
                try {
                    if (!fs.existsSync(testFile)) {
                        response = NextResponse.json({ error: 'Test file not found' }, { status: 404 });
                    }
                    else {
                        fs.writeFileSync(testFile, safeJsonStringify(test));
                        console.log(`PUT /api/tests: Test "${test.name}" updated successfully`);
                        response = NextResponse.json({ message: `Test "${test.name}" updated successfully` }, { status: 200 });
                    }
                } catch (error) {
                    response = NextResponse.json({ error: `Failed to update test file: ${error}` }, { status: 500 });
                }
            }
        }    
    }
    return response;
}