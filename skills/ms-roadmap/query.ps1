[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('get_recent_m365_roadmaps', 'get_m365_roadmap_by_id', 'get_recent_azure_updates', 'get_azure_update_by_id')]
    [string]$Tool,

    [Parameter(Mandatory = $false)]
    [string]$ArgsJson = '{}'
)

$ErrorActionPreference = 'Stop'
$endpoint = 'https://www.microsoft.com/releasecommunications/mcp'

try {
    $argsObj = if ([string]::IsNullOrWhiteSpace($ArgsJson)) { @{} } else { $ArgsJson | ConvertFrom-Json -AsHashtable }
} catch {
    Write-Error "ArgsJson is not valid JSON: $_"
    exit 2
}

$payload = @{
    jsonrpc = '2.0'
    id      = (Get-Random -Minimum 1 -Maximum 100000)
    method  = 'tools/call'
    params  = @{
        name      = $Tool
        arguments = $argsObj
    }
} | ConvertTo-Json -Depth 12 -Compress

$tmp = New-TemporaryFile
try {
    Set-Content -Path $tmp -Value $payload -Encoding utf8 -NoNewline
    $raw = & curl.exe -sS -X POST $endpoint `
        -H 'Content-Type: application/json' `
        -H 'Accept: application/json, text/event-stream' `
        --data-binary "@$tmp"
} finally {
    Remove-Item $tmp -ErrorAction SilentlyContinue
}

# The server replies as SSE: lines like "event: message" and "data: {json}".
# Extract the JSON from the data: line(s).
$jsonLine = ($raw -split "`n") | Where-Object { $_ -like 'data: *' } | Select-Object -First 1
if (-not $jsonLine) {
    Write-Output $raw
    exit 0
}
$json = $jsonLine.Substring(6).Trim()

try {
    $obj = $json | ConvertFrom-Json -Depth 64
} catch {
    Write-Output $json
    exit 0
}

if ($obj.error) {
    $obj.error | ConvertTo-Json -Depth 12
    exit 1
}

# tools/call result wraps content as an array of {type, text}. Unwrap text payloads (often JSON strings).
if ($obj.result -and $obj.result.content) {
    foreach ($c in $obj.result.content) {
        if ($c.type -eq 'text') {
            try {
                $inner = $c.text | ConvertFrom-Json -Depth 64
                $inner | ConvertTo-Json -Depth 64
            } catch {
                Write-Output $c.text
            }
        } else {
            $c | ConvertTo-Json -Depth 12
        }
    }
} else {
    $obj | ConvertTo-Json -Depth 64
}


