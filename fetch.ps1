$artists = @(
    @{term="arijit singh tum hi ho"},
    @{term="arijit singh channa mereya"},
    @{term="yo yo honey singh blue eyes"},
    @{term="yo yo honey singh desi kalakaar"},
    @{term="talha anjum gumaan"},
    @{term="talha anjum downers at dusk"},
    @{term="nusrat fateh ali khan mere rashke qamar"},
    @{term="nusrat fateh ali khan yeh jo halka"}
)
$result = @()
foreach ($a in $artists) {
    $url = "https://itunes.apple.com/search?term=$($a.term -replace ' ','+')&limit=1&entity=song"
    try {
        $res = Invoke-RestMethod -Uri $url
        if ($res.results.Count -gt 0) {
            $song = $res.results[0]
            $result += @{
                title = $song.trackName
                artist = $song.artistName
                src = $song.previewUrl
                cover = ($song.artworkUrl100 -replace '100x100bb','600x600bb')
            }
        }
    } catch {
        Write-Host "Failed to fetch $($a.term)"
    }
}
$result | ConvertTo-Json | Out-File "songs.json"
