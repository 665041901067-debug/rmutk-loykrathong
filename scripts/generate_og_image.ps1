Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# 1. Dark Midnight Sky to Deep Indigo Water Background Gradient
$bgRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$cTop = [System.Drawing.Color]::FromArgb(255, 6, 12, 28)
$cMid = [System.Drawing.Color]::FromArgb(255, 12, 24, 52)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, $cTop, $cMid, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($bgBrush, $bgRect)
$bgBrush.Dispose()

# Ambient Water Horizon (Lower section Y: 390 to 630)
$waterRect = New-Object System.Drawing.Rectangle(0, 390, $width, 240)
$cWater1 = [System.Drawing.Color]::FromArgb(255, 10, 22, 46)
$cWater2 = [System.Drawing.Color]::FromArgb(255, 4, 8, 18)
$waterBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($waterRect, $cWater1, $cWater2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($waterBrush, $waterRect)
$waterBrush.Dispose()

# Water surface subtle line
$waterLinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 251, 191, 36), [float]1.5)
$g.DrawLine($waterLinePen, 0, 390, $width, 390)
$waterLinePen.Dispose()

# 2. Ambient Stars in Night Sky
$rand = New-Object System.Random(1337)
for ($i = 0; $i -lt 90; $i++) {
    $sx = $rand.Next(0, $width)
    $sy = $rand.Next(0, 380)
    $size = $rand.Next(1, 4)
    $alpha = $rand.Next(70, 230)
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
    $g.FillEllipse($starBrush, $sx, $sy, $size, $size)
    $starBrush.Dispose()
}

# 3. Luminous Full Moon (Top Right X: 1000, Y: 110)
$moonCenterX = 1000
$moonCenterY = 110
$moonRadius = 55

# Multi-layered soft atmospheric moon glow
for ($r = 130; $r -ge 60; $r -= 10) {
    $alpha = [int](22 * (130 - $r) / 70)
    $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 254, 240, 138))
    $g.FillEllipse($glowBrush, [int]($moonCenterX - $r), [int]($moonCenterY - $r), [int]($r * 2), [int]($r * 2))
    $glowBrush.Dispose()
}
$moonBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 253, 230))
$g.FillEllipse($moonBrush, [int]($moonCenterX - $moonRadius), [int]($moonCenterY - $moonRadius), [int]($moonRadius * 2), [int]($moonRadius * 2))
$moonBrush.Dispose()

# Subtle moon craters
$craterBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 180, 160, 120))
$g.FillEllipse($craterBrush, [int]($moonCenterX - 20), [int]($moonCenterY - 15), 22, 18)
$g.FillEllipse($craterBrush, [int]($moonCenterX + 10), [int]($moonCenterY + 12), 16, 14)
$g.FillEllipse($craterBrush, [int]($moonCenterX - 8), [int]($moonCenterY + 22), 12, 10)
$craterBrush.Dispose()

# 4. Floating Sky Lanterns in background
$lanterns = @(
    @{ X = 840; Y = 160; W = 16; H = 22; Alpha = 200 },
    @{ X = 740; Y = 220; W = 12; H = 17; Alpha = 170 },
    @{ X = 920; Y = 260; W = 14; H = 19; Alpha = 180 },
    @{ X = 1120; Y = 190; W = 18; H = 24; Alpha = 210 },
    @{ X = 670; Y = 140; W = 10; H = 14; Alpha = 140 }
)
foreach ($lt in $lanterns) {
    # Lantern halo glow
    $lGlow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb([int]($lt.Alpha * 0.35), 251, 191, 36))
    $g.FillEllipse($lGlow, [int]($lt.X - 8), [int]($lt.Y - 6), [int]($lt.W + 16), [int]($lt.H + 12))
    $lGlow.Dispose()
    # Lantern body
    $lBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($lt.Alpha, 254, 215, 120))
    $g.FillRectangle($lBrush, [int]$lt.X, [int]$lt.Y, [int]$lt.W, [int]$lt.H)
    $lBrush.Dispose()
    # Base ring
    $lBase = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($lt.Alpha, 180, 83, 9))
    $g.FillRectangle($lBase, [int]($lt.X - 1), [int]($lt.Y + $lt.H), [int]($lt.W + 2), 2)
    $lBase.Dispose()
}

# 5. Hero Krathong (Center-Right at X: 880, Y: 430)
$kx = 880
$ky = 430

# Water Ripples under Krathong
for ($i = 4; $i -ge 1; $i--) {
    $rw = [int](180 + ($i * 45))
    $rh = [int](28 + ($i * 12))
    $ra = [int](35 / $i)
    $ripPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($ra, 251, 191, 36), [float]1.8)
    $g.DrawEllipse($ripPen, [int]($kx - ($rw / 2)), [int]($ky + 25 - ($rh / 2)), $rw, $rh)
    $ripPen.Dispose()
}

# Candlelight water reflection glow
$refRect = New-Object System.Drawing.Rectangle([int]($kx - 90), [int]($ky + 20), 180, 70)
$cRef1 = [System.Drawing.Color]::FromArgb(120, 245, 158, 11)
$cRef2 = [System.Drawing.Color]::FromArgb(0, 245, 158, 11)
$refBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($refRect, $cRef1, $cRef2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($refBrush, [int]($kx - 90), [int]($ky + 15), 180, 60)
$refBrush.Dispose()

# Outer Banana Leaf Base (Wide Emerald Ellipse)
$leafRect = New-Object System.Drawing.Rectangle([int]($kx - 145), [int]($ky - 20), 290, 65)
$cLeaf1 = [System.Drawing.Color]::FromArgb(255, 16, 185, 129)
$cLeaf2 = [System.Drawing.Color]::FromArgb(255, 4, 120, 87)
$leafOuterBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($leafRect, $cLeaf1, $cLeaf2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($leafOuterBrush, [int]($kx - 145), [int]($ky - 15), 290, 58)
$leafOuterBrush.Dispose()

# Outer Petal Crown (Folded Banana Leaves / Lotus Points)
$petalCount = 14
$petalBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 52, 211, 153))
$petalBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 5, 150, 105))
for ($p = 0; $p -lt $petalCount; $p++) {
    $angle = ($p / ($petalCount - 1)) * [Math]::PI
    $px = [float]($kx - 130 * [Math]::Cos($angle))
    $py = [float]($ky + 5 - 22 * [Math]::Sin($angle))
    $tipY = [float]($py - 24)

    [System.Drawing.PointF[]]$poly = @(
        (New-Object System.Drawing.PointF([float]($px - 14), [float]$py)),
        (New-Object System.Drawing.PointF([float]$px, [float]$tipY)),
        (New-Object System.Drawing.PointF([float]($px + 14), [float]$py))
    )
    $brush = if ($p % 2 -eq 0) { $petalBrush1 } else { $petalBrush2 }
    $g.FillPolygon($brush, $poly)
}
$petalBrush1.Dispose()
$petalBrush2.Dispose()

# Inner Pink Lotus Petal Layer
$lotusRect = New-Object System.Drawing.Rectangle([int]($kx - 105), [int]($ky - 25), 210, 50)
$cPink1 = [System.Drawing.Color]::FromArgb(255, 251, 113, 133)
$cPink2 = [System.Drawing.Color]::FromArgb(255, 225, 29, 72)
$innerLotusBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($lotusRect, $cPink1, $cPink2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($innerLotusBrush, [int]($kx - 105), [int]($ky - 22), 210, 48)
$innerLotusBrush.Dispose()

for ($p = 0; $p -lt 10; $p++) {
    $angle = ($p / 9) * [Math]::PI
    $px = [float]($kx - 95 * [Math]::Cos($angle))
    $py = [float]($ky - 12 - 16 * [Math]::Sin($angle))
    $tipY = [float]($py - 20)
    [System.Drawing.PointF[]]$polyPink = @(
        (New-Object System.Drawing.PointF([float]($px - 10), [float]$py)),
        (New-Object System.Drawing.PointF([float]$px, [float]$tipY)),
        (New-Object System.Drawing.PointF([float]($px + 10), [float]$py))
    )
    $pinkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 164, 175))
    $g.FillPolygon($pinkBrush, $polyPink)
    $pinkBrush.Dispose()
}

# Golden Center Floral Bed (Marigolds)
$flowerBedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
$g.FillEllipse($flowerBedBrush, [int]($kx - 75), [int]($ky - 28), 150, 36)
$flowerBedBrush.Dispose()

# Marigold flower clusters
$goldFlowerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
$marigoldOffsets = @(-45, -22, 0, 22, 45)
foreach ($mo in $marigoldOffsets) {
    $g.FillEllipse($goldFlowerBrush, [int]($kx + $mo - 12), [int]($ky - 28), 24, 20)
}
$goldFlowerBrush.Dispose()

# Incense Sticks (3 Sticks angled)
$incensePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 180, 83, 9), [float]2.5)
$g.DrawLine($incensePen, [int]($kx - 12), [int]($ky - 24), [int]($kx - 24), [int]($ky - 85))
$g.DrawLine($incensePen, [int]($kx - 5), [int]($ky - 24), [int]($kx - 10), [int]($ky - 90))
$g.DrawLine($incensePen, [int]($kx + 2), [int]($ky - 24), [int]($kx + 4), [int]($ky - 88))
$incensePen.Dispose()

# Glowing Incense Tips
$redTipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
$g.FillEllipse($redTipBrush, [int]($kx - 26), [int]($ky - 88), 5, 5)
$g.FillEllipse($redTipBrush, [int]($kx - 12), [int]($ky - 93), 5, 5)
$g.FillEllipse($redTipBrush, [int]($kx + 2), [int]($ky - 91), 5, 5)
$redTipBrush.Dispose()

# Central Candle (Gold & Ivory Pillar)
$candleRect = New-Object System.Drawing.Rectangle([int]($kx + 10), [int]($ky - 75), 14, 52)
$cCandle1 = [System.Drawing.Color]::FromArgb(255, 254, 243, 199)
$cCandle2 = [System.Drawing.Color]::FromArgb(255, 245, 158, 11)
$candleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($candleRect, $cCandle1, $cCandle2, [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillRectangle($candleBrush, $candleRect)
$candleBrush.Dispose()

# Candle Flame Radiance / Ambient Bloom
for ($fr = 85; $fr -ge 20; $fr -= 10) {
    $fa = [int](30 * (85 - $fr) / 65)
    $flameBloom = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($fa, 251, 191, 36))
    $g.FillEllipse($flameBloom, [int]($kx + 17 - $fr), [int]($ky - 88 - $fr), [int]($fr * 2), [int]($fr * 2))
    $flameBloom.Dispose()
}

# Teardrop Candle Flame
$flameOuterBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 249, 115, 22))
$g.FillEllipse($flameOuterBrush, [int]($kx + 11), [int]($ky - 102), 12, 28)
$flameOuterBrush.Dispose()

$flameInnerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71))
$g.FillEllipse($flameInnerBrush, [int]($kx + 13), [int]($ky - 98), 8, 20)
$flameInnerBrush.Dispose()

$flameCoreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.FillEllipse($flameCoreBrush, [int]($kx + 15), [int]($ky - 92), 4, 10)
$flameCoreBrush.Dispose()


# 6. TYPOGRAPHY (Left Section: X: 90, Y: 170-430)
# Modern Thai Font
$thaiFontFamily = 'Leelawadee UI'
try {
    $testFont = New-Object System.Drawing.Font('Prompt', 12)
    if ($testFont.Name -eq 'Prompt') { $thaiFontFamily = 'Prompt' }
    $testFont.Dispose()
} catch {}

# Main Title Line 1: ลอยกระทงออนไลน์ (Big, bold, ultra-clean)
$titleFont = New-Object System.Drawing.Font($thaiFontFamily, 68, [System.Drawing.FontStyle]::Bold)
$titleText = "ลอยกระทงออนไลน์"

# Drop Shadow for high-contrast thumbnail readability
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 0, 0, 0))
$g.DrawString($titleText, $titleFont, $shadowBrush, 93, 218)
$g.DrawString($titleText, $titleFont, $shadowBrush, 89, 214)
$shadowBrush.Dispose()

# Main text pure white
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.DrawString($titleText, $titleFont, $titleBrush, 90, 215)
$titleBrush.Dispose()
$titleFont.Dispose()

# Main Title Line 2: มทร.กรุงเทพ (Radiant golden amber)
$subTitleFont = New-Object System.Drawing.Font($thaiFontFamily, 60, [System.Drawing.FontStyle]::Bold)
$subTitleText = "มทร.กรุงเทพ"

# Golden shadow
$goldShadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 0, 0, 0))
$g.DrawString($subTitleText, $subTitleFont, $goldShadowBrush, 93, 333)
$goldShadowBrush.Dispose()

# Radiant Gold Text
$goldTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
$g.DrawString($subTitleText, $subTitleFont, $goldTextBrush, 90, 330)
$goldTextBrush.Dispose()
$subTitleFont.Dispose()

# Modern Minimal Golden Beam Accent Line
$accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 251, 191, 36), [float]4.0)
$g.DrawLine($accentPen, 90, 445, 340, 445)
$accentPen.Dispose()

$accentGlowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 251, 191, 36), [float]12.0)
$g.DrawLine($accentGlowPen, 90, 445, 340, 445)
$accentGlowPen.Dispose()


# 7. Save High-Quality PNG to public/og-image.png
$outputPath = "D:\rmutk_loykrathong\public\og-image.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Output "Successfully generated $outputPath (1200x630)"
