import { Logger } from '@nestjs/common'
import { existsSync } from 'fs'
import { resolve } from 'path'
import color from 'colors-cli/safe'
export type EnvPatternPart = {
    value: string
    type: 'filename' | 'node_env'
    optional?: boolean
}

const EnvLogger = new Logger('EnvResolver')

function processPattern(pattern: EnvPatternPart[]): string {
    const env = process.env.NODE_ENV || 'development'
    return pattern.map(part => {
        if (part.type === 'node_env') {
            return part.value.replace('$1', env)
        }
        return part.value
    }).join('')
}

function generatePatternCombinations(pattern: EnvPatternPart[]): string[] {
    const env = process.env.NODE_ENV || 'development'

    const combinations: string[][] = [[]]
    pattern.forEach(part => {
        const processed = part.type === 'node_env' ? part.value.replace('$1', env) : part.value
        const currentLength = combinations.length

        for (let i = 0; i < currentLength; i++) {
            if (part.optional) {
                // Keep the combination without this part
                combinations.push([...combinations[i]])
            }
            // Add the part to the existing combination
            combinations[i].push(processed)
        }
    })

    return combinations.map(parts => parts.join(''))
}

export function resolveEnvPath(
    dest: string,
    ignoreEnvSpecificWarn: boolean = false,
    pattern: EnvPatternPart[] = [
        { value: '.env', type: 'filename' },
        { value: '.$1', type: 'node_env', optional: true }
    ]
): string {
    const defaultPattern: EnvPatternPart[] = [
        { value: '.env', type: 'filename' }
    ]

    const filesToTry = [
        ...generatePatternCombinations(pattern),
        ...generatePatternCombinations(defaultPattern)
    ]

    const config = {
        resolvedBy: null as string | null,
        filepath: null as string | null
    }

    for (const filename of filesToTry) {
        const filepath = resolve(`${dest}/${filename}`)
        if (existsSync(filepath)) {
            config.resolvedBy = filename
            config.filepath = filepath
            break
        }
    }

    if (!config.filepath) {
        throw new Error(`Couldn't load environment file from any sources:\nTried: ${filesToTry.join('\n  - ')}`)
    }

    if (config.resolvedBy === '.env') {
        if (!ignoreEnvSpecificWarn) {
            EnvLogger.warn(`Using fallback .env file`)
        } else {
            EnvLogger.log(`Using .env file`)
        }
    } else {
        EnvLogger.log(color.green(`Using ${color.cyan(config.resolvedBy)} file`))
    }

    return config.filepath
}