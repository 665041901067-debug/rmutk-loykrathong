Add-Type -AssemblyName System.Drawing

$width = 1080
$height = 1350
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# 1. Dark Midnight to Deep Twilight Sky Gradient Background
$bgRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$cSkyTop = [System.Drawing.Color]::FromArgb(255, 6, 12, 28)
$cSkyMid = [System.Drawing.Color]::FromArgb(255, 12, 26, 56)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, $cSkyTop, $cSkyMid, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($bgBrush, $bgRect)
$bgBrush.Dispose()

# Ambient Water Surface (Y: 760 to 1350)
$waterRect = New-Object System.Drawing.Rectangle(0, 760, $width, 590)
$cWater1 = [System.Drawing.Color]::FromArgb(255, 10, 24, 48)
$cWater2 = [System.Drawing.Color]::FromArgb(255, 4, 8, 18)
$waterBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($waterRect, $cWater1, $cWater2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($waterBrush, $waterRect)
$waterBrush.Dispose()

# Water surface dividing line
$waterLinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 251, 191, 36), [float]1.5)
$g.DrawLine($waterLinePen, 0, 760, $width, 760)
$waterLinePen.Dispose()

# 2. Ambient Stars
$rand = New-Object System.Random(2026)
for ($i = 0; $i -lt 110; $i++) {
    $sx = $rand.Next(0, $width)
    $sy = $rand.Next(0, 750)
    $size = $rand.Next(1, 4)
    $alpha = $rand.Next(60, 220)
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
    $g.FillEllipse($starBrush, $sx, $sy, $size, $size)
    $starBrush.Dispose()
}

# 3. Glowing Full Moon (Top Right X: 910, Y: 140)
$moonCenterX = 910
$moonCenterY = 140
$moonRadius = 50

for ($r = 120; $r -ge 55; $r -= 10) {
    $alpha = [int](20 * (120 - $r) / 65)
    $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 254, 240, 138))
    $g.FillEllipse($glowBrush, [int]($moonCenterX - $r), [int]($moonCenterY - $r), [int]($r * 2), [int]($r * 2))
    $glowBrush.Dispose()
}
$moonBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 253, 230))
$g.FillEllipse($moonBrush, [int]($moonCenterX - $moonRadius), [int]($moonCenterY - $moonRadius), [int]($moonRadius * 2), [int]($moonRadius * 2))
$moonBrush.Dispose()

# Moon craters
$craterBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 180, 160, 120))
$g.FillEllipse($craterBrush, [int]($moonCenterX - 18), [int]($moonCenterY - 12), 20, 16)
$g.FillEllipse($craterBrush, [int]($moonCenterX + 8), [int]($moonCenterY + 10), 14, 12)
$craterBrush.Dispose()

# Floating Sky Lanterns
$lanterns = @(
    @{ X = 770; Y = 200; W = 16; H = 22; Alpha = 200 },
    @{ X = 690; Y = 260; W = 12; H = 17; Alpha = 170 },
    @{ X = 840; Y = 290; W = 14; H = 19; Alpha = 180 },
    @{ X = 980; Y = 240; W = 18; H = 24; Alpha = 210 },
    @{ X = 620; Y = 180; W = 10; H = 14; Alpha = 140 }
)
foreach ($lt in $lanterns) {
    $lGlow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb([int]($lt.Alpha * 0.35), 251, 191, 36))
    $g.FillEllipse($lGlow, [int]($lt.X - 8), [int]($lt.Y - 6), [int]($lt.W + 16), [int]($lt.H + 12))
    $lGlow.Dispose()
    $lBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($lt.Alpha, 254, 215, 120))
    $g.FillRectangle($lBrush, [int]$lt.X, [int]$lt.Y, [int]$lt.W, [int]$lt.H)
    $lBrush.Dispose()
    $lBase = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($lt.Alpha, 180, 83, 9))
    $g.FillRectangle($lBase, [int]($lt.X - 1), [int]($lt.Y + $lt.H), [int]($lt.W + 2), 2)
    $lBase.Dispose()
}


# 4. TYPOGRAPHY - Modern Thai Font
$thaiFontFamily = 'Leelawadee UI'
try {
    $testFont = New-Object System.Drawing.Font('Prompt', 12)
    if ($testFont.Name -eq 'Prompt') { $thaiFontFamily = 'Prompt' }
    $testFont.Dispose()
} catch {}

# Top Pill: RMUTK ONLINE LOY KRATHONG FESTIVAL
$topBadgeX = 80
$topBadgeY = 75
$topBadgeW = 310
$topBadgeH = 38
$topBadgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 255, 255, 255))
$topBadgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 251, 191, 36), [float]1.2)
$g.FillRectangle($topBadgeBg, $topBadgeX, $topBadgeY, $topBadgeW, $topBadgeH)
$g.DrawRectangle($topBadgePen, $topBadgeX, $topBadgeY, $topBadgeW, $topBadgeH)
$topBadgeBg.Dispose()
$topBadgePen.Dispose()

$badgeFont = New-Object System.Drawing.Font($thaiFontFamily, 12, [System.Drawing.FontStyle]::Bold)
$badgeTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 230, 138))
$g.DrawString("RMUTK ONLINE FESTIVAL • 2569", $badgeFont, $badgeTextBrush, [float]($topBadgeX + 18), [float]($topBadgeY + 10))
$badgeFont.Dispose()
$badgeTextBrush.Dispose()

# Main Headline Line 1: มาลอยกระทงด้วยกันนะ (Clean, warm, Gen-Z)
$h1Font = New-Object System.Drawing.Font($thaiFontFamily, 46, [System.Drawing.FontStyle]::Bold)
$h1Text = "มาลอยกระทงด้วยกันนะ"
$h1Shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 0, 0, 0))
$g.DrawString($h1Text, $h1Font, $h1Shadow, 84, 134)
$h1Shadow.Dispose()
$h1Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.DrawString($h1Text, $h1Font, $h1Brush, 80, 130)
$h1Brush.Dispose()
$h1Font.Dispose()

# Main Headline Line 2: สระน้ำออนไลน์ มทร.กรุงเทพ (Golden glow)
$h2Font = New-Object System.Drawing.Font($thaiFontFamily, 32, [System.Drawing.FontStyle]::Bold)
$h2Text = "สระน้ำออนไลน์ มทร.กรุงเทพ"
$h2Shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 0, 0, 0))
$g.DrawString($h2Text, $h2Font, $h2Shadow, 83, 223)
$h2Shadow.Dispose()
$h2Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
$g.DrawString($h2Text, $h2Font, $h2Brush, 80, 220)
$h2Brush.Dispose()
$h2Font.Dispose()

# Subtle Subtitle
$subFont = New-Object System.Drawing.Font($thaiFontFamily, 16, [System.Drawing.FontStyle]::Regular)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 203, 213, 225))
$g.DrawString("อยู่ที่ไหนก็ลอยได้ • ชวนเพื่อน คนคุย หรือมาลอยเดี่ยวแบบเรียลไทม์", $subFont, $subBrush, 80, 290)
$subFont.Dispose()
$subBrush.Dispose()


# 5. GIMMICKS FEATURE PILLS / CARDS (4 Highlights in 2x2 Grid, Y: 345 to 495)
$features = @(
    @{ Title = "กระทงประจำ 8 คณะ"; Sub = "ฐานเกียร์ พจนานุกรม สิ่งทอ คหกรรม"; X = 80; Y = 340 },
    @{ Title = "ลอยเป็นก๊วนกับเพื่อน"; Sub = "แชร์ลิงก์ชวนเพื่อนลอยเคียงข้างกัน"; X = 550; Y = 340 },
    @{ Title = "บ่อเต่าแก้เคล็ด F"; Sub = "โยนเหรียญเสริมดวง แข่งแต้มคณะ"; X = 80; Y = 425 },
    @{ Title = "ปล่อยโคม & ไฟเย็น"; Sub = "สลักคำอธิษฐานเรืองแสงสู่ฟากฟ้า"; X = 550; Y = 425 }
)

$fTitleFont = New-Object System.Drawing.Font($thaiFontFamily, 14, [System.Drawing.FontStyle]::Bold)
$fSubFont = New-Object System.Drawing.Font($thaiFontFamily, 11, [System.Drawing.FontStyle]::Regular)

foreach ($f in $features) {
    # Card background (frosted glass)
    $fRect = New-Object System.Drawing.Rectangle([int]$f.X, [int]$f.Y, 450, 68)
    $fBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 255, 255, 255))
    $fBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 251, 191, 36), [float]1.0)
    $g.FillRectangle($fBg, $fRect)
    $g.DrawRectangle($fBorder, $fRect)
    $fBg.Dispose()
    $fBorder.Dispose()

    # Small gold dot accent
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
    $g.FillEllipse($dotBrush, [int]($f.X + 16), [int]($f.Y + 22), 8, 8)
    $dotBrush.Dispose()

    # Title text
    $fTitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
    $g.DrawString($f.Title, $fTitleFont, $fTitleBrush, [float]($f.X + 34), [float]($f.Y + 12))
    $fTitleBrush.Dispose()

    # Sub text
    $fSubBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 226, 232, 240))
    $g.DrawString($f.Sub, $fSubFont, $fSubBrush, [float]($f.X + 34), [float]($f.Y + 36))
    $fSubBrush.Dispose()
}
$fTitleFont.Dispose()
$fSubFont.Dispose()


# 6. HERO KRATHONG (Centered at X: 540, Y: 680 on water surface)
$kx = 540
$ky = 690

# Water Ripples under Krathong
for ($i = 5; $i -ge 1; $i--) {
    $rw = [int](240 + ($i * 65))
    $rh = [int](36 + ($i * 15))
    $ra = [int](40 / $i)
    $ripPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($ra, 251, 191, 36), [float]2.0)
    $g.DrawEllipse($ripPen, [int]($kx - ($rw / 2)), [int]($ky + 35 - ($rh / 2)), $rw, $rh)
    $ripPen.Dispose()
}

# Candlelight water reflection glow
$refRect = New-Object System.Drawing.Rectangle([int]($kx - 120), [int]($ky + 25), 240, 95)
$cRef1 = [System.Drawing.Color]::FromArgb(130, 245, 158, 11)
$cRef2 = [System.Drawing.Color]::FromArgb(0, 245, 158, 11)
$refBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($refRect, $cRef1, $cRef2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($refBrush, [int]($kx - 120), [int]($ky + 20), 240, 85)
$refBrush.Dispose()

# Outer Banana Leaf Base
$leafRect = New-Object System.Drawing.Rectangle([int]($kx - 190), [int]($ky - 25), 380, 85)
$cLeaf1 = [System.Drawing.Color]::FromArgb(255, 16, 185, 129)
$cLeaf2 = [System.Drawing.Color]::FromArgb(255, 4, 120, 87)
$leafOuterBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($leafRect, $cLeaf1, $cLeaf2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($leafOuterBrush, [int]($kx - 190), [int]($ky - 20), 380, 75)
$leafOuterBrush.Dispose()

# Outer Petal Crown (Folded Banana Leaves / Lotus Points)
$petalCount = 16
$petalBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 52, 211, 153))
$petalBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 5, 150, 105))
for ($p = 0; $p -lt $petalCount; $p++) {
    $angle = ($p / ($petalCount - 1)) * [Math]::PI
    $px = [float]($kx - 175 * [Math]::Cos($angle))
    $py = [float]($ky + 5 - 28 * [Math]::Sin($angle))
    $tipY = [float]($py - 30)

    [System.Drawing.PointF[]]$poly = @(
        (New-Object System.Drawing.PointF([float]($px - 16), [float]$py)),
        (New-Object System.Drawing.PointF([float]$px, [float]$tipY)),
        (New-Object System.Drawing.PointF([float]($px + 16), [float]$py))
    )
    $brush = if ($p % 2 -eq 0) { $petalBrush1 } else { $petalBrush2 }
    $g.FillPolygon($brush, $poly)
}
$petalBrush1.Dispose()
$petalBrush2.Dispose()

# Inner Pink Lotus Petal Layer
$lotusRect = New-Object System.Drawing.Rectangle([int]($kx - 140), [int]($ky - 30), 280, 65)
$cPink1 = [System.Drawing.Color]::FromArgb(255, 251, 113, 133)
$cPink2 = [System.Drawing.Color]::FromArgb(255, 225, 29, 72)
$innerLotusBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($lotusRect, $cPink1, $cPink2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($innerLotusBrush, [int]($kx - 140), [int]($ky - 28), 280, 62)
$innerLotusBrush.Dispose()

for ($p = 0; $p -lt 12; $p++) {
    $angle = ($p / 11) * [Math]::PI
    $px = [float]($kx - 128 * [Math]::Cos($angle))
    $py = [float]($ky - 15 - 22 * [Math]::Sin($angle))
    $tipY = [float]($py - 26)
    [System.Drawing.PointF[]]$polyPink = @(
        (New-Object System.Drawing.PointF([float]($px - 14), [float]$py)),
        (New-Object System.Drawing.PointF([float]$px, [float]$tipY)),
        (New-Object System.Drawing.PointF([float]($px + 14), [float]$py))
    )
    $pinkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 164, 175))
    $g.FillPolygon($pinkBrush, $polyPink)
    $pinkBrush.Dispose()
}

# Golden Center Floral Bed (Marigolds)
$flowerBedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
$g.FillEllipse($flowerBedBrush, [int]($kx - 95), [int]($ky - 35), 190, 46)
$flowerBedBrush.Dispose()

# Marigold flower clusters
$goldFlowerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
$marigoldOffsets = @(-55, -28, 0, 28, 55)
foreach ($mo in $marigoldOffsets) {
    $g.FillEllipse($goldFlowerBrush, [int]($kx + $mo - 15), [int]($ky - 36), 30, 25)
}
$goldFlowerBrush.Dispose()

# Incense Sticks (3 Sticks angled)
$incensePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 180, 83, 9), [float]3.0)
$g.DrawLine($incensePen, [int]($kx - 16), [int]($ky - 30), [int]($kx - 30), [int]($ky - 105))
$g.DrawLine($incensePen, [int]($kx - 7), [int]($ky - 30), [int]($kx - 12), [int]($ky - 112))
$g.DrawLine($incensePen, [int]($kx + 3), [int]($ky - 30), [int]($kx + 5), [int]($ky - 110))
$incensePen.Dispose()

# Glowing Incense Tips
$redTipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
$g.FillEllipse($redTipBrush, [int]($kx - 33), [int]($ky - 109), 6, 6)
$g.FillEllipse($redTipBrush, [int]($kx - 15), [int]($ky - 116), 6, 6)
$g.FillEllipse($redTipBrush, [int]($kx + 3), [int]($ky - 114), 6, 6)
$redTipBrush.Dispose()

# Central Candle (Gold & Ivory Pillar)
$candleRect = New-Object System.Drawing.Rectangle([int]($kx + 12), [int]($ky - 95), 18, 66)
$cCandle1 = [System.Drawing.Color]::FromArgb(255, 254, 243, 199)
$cCandle2 = [System.Drawing.Color]::FromArgb(255, 245, 158, 11)
$candleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($candleRect, $cCandle1, $cCandle2, [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillRectangle($candleBrush, $candleRect)
$candleBrush.Dispose()

# Candle Flame Radiance / Ambient Bloom
for ($fr = 110; $fr -ge 25; $fr -= 12) {
    $fa = [int](32 * (110 - $fr) / 85)
    $flameBloom = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($fa, 251, 191, 36))
    $g.FillEllipse($flameBloom, [int]($kx + 21 - $fr), [int]($ky - 112 - $fr), [int]($fr * 2), [int]($fr * 2))
    $flameBloom.Dispose()
}

# Teardrop Candle Flame
$flameOuterBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 249, 115, 22))
$g.FillEllipse($flameOuterBrush, [int]($kx + 13), [int]($ky - 128), 16, 36)
$flameOuterBrush.Dispose()

$flameInnerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71))
$g.FillEllipse($flameInnerBrush, [int]($kx + 16), [int]($ky - 123), 10, 26)
$flameInnerBrush.Dispose()

$flameCoreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.FillEllipse($flameCoreBrush, [int]($kx + 18), [int]($ky - 116), 6, 14)
$flameCoreBrush.Dispose()


# 7. BOTTOM QR CODE & CALL TO ACTION CARD (Y: 880 to 1260)
$ctaX = 80
$ctaY = 880
$ctaW = 920
$ctaH = 390

# Card background (Frosted glass container with golden border)
$ctaRect = New-Object System.Drawing.Rectangle($ctaX, $ctaY, $ctaW, $ctaH)
$ctaBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 15, 23, 42))
$ctaBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 251, 191, 36), [float]2.0)
$g.FillRectangle($ctaBg, $ctaRect)
$g.DrawRectangle($ctaBorder, $ctaRect)
$ctaBg.Dispose()
$ctaBorder.Dispose()

# Inner glowing ambient corner
$glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(35, 251, 191, 36), [float]8.0)
$g.DrawRectangle($glowPen, $ctaX + 4, $ctaY + 4, $ctaW - 8, $ctaH - 8)
$glowPen.Dispose()

# Draw QR Code with crisp white background frame
$qrPath = "D:\rmutk_loykrathong\public\qr-code.png"
if (Test-Path $qrPath) {
    $qrImg = [System.Drawing.Image]::FromFile($qrPath)
    $qrSize = 290
    $qrPosX = $ctaX + 50
    $qrPosY = $ctaY + 50

    # White backing for QR code
    $qrBackRect = New-Object System.Drawing.Rectangle([int]($qrPosX - 12), [int]($qrPosY - 12), [int]($qrSize + 24), [int]($qrSize + 24))
    $qrBackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillRectangle($qrBackBrush, $qrBackRect)
    $qrBackBrush.Dispose()

    # Draw QR code image
    $g.DrawImage($qrImg, [float]$qrPosX, [float]$qrPosY, [float]$qrSize, [float]$qrSize)
    $qrImg.Dispose()
}

# Right Side CTA Information
$infoX = $ctaX + 390
$infoY = $ctaY + 65

# Mini tag: SCAN ME
$scanBadgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 251, 191, 36))
$scanBadgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 251, 191, 36), [float]1.0)
$g.FillRectangle($scanBadgeBg, $infoX, $infoY, 180, 32)
$g.DrawRectangle($scanBadgePen, $infoX, $infoY, 180, 32)
$scanBadgeBg.Dispose()
$scanBadgePen.Dispose()

$scanTagFont = New-Object System.Drawing.Font($thaiFontFamily, 11, [System.Drawing.FontStyle]::Bold)
$scanTagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
$g.DrawString("SCAN TO FLOAT • สแกนเลย", $scanTagFont, $scanTagBrush, [float]($infoX + 12), [float]($infoY + 7))
$scanTagFont.Dispose()
$scanTagBrush.Dispose()

# Big Callout Headline
$ctaTitleFont = New-Object System.Drawing.Font($thaiFontFamily, 28, [System.Drawing.FontStyle]::Bold)
$ctaTitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.DrawString("สแกนแล้วมาลอยด้วยกัน!", $ctaTitleFont, $ctaTitleBrush, [float]$infoX, [float]($infoY + 48))
$ctaTitleFont.Dispose()
$ctaTitleBrush.Dispose()

# Website Domain Box (Golden highlight)
$domainFont = New-Object System.Drawing.Font($thaiFontFamily, 18, [System.Drawing.FontStyle]::Bold)
$domainBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
$g.DrawString("rmutk-loykrathong.vercel.app", $domainFont, $domainBrush, [float]$infoX, [float]($infoY + 110))
$domainFont.Dispose()
$domainBrush.Dispose()

# Feature Highlights in QR card
$descFont = New-Object System.Drawing.Font($thaiFontFamily, 14, [System.Drawing.FontStyle]::Regular)
$descBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 203, 213, 225))
$g.DrawString("✓ อัปเดตผิวน้ำและคำอธิษฐานแบบเรียลไทม์", $descFont, $descBrush, [float]$infoX, [float]($infoY + 160))
$g.DrawString("✓ เข้าได้ทุกอุปกรณ์ มือถือ ไอแพด คอมพิวเตอร์", $descFont, $descBrush, [float]$infoX, [float]($infoY + 195))
$g.DrawString("✓ ชวนเพื่อนมาลอยเป็นกลุ่ม หรือลอยเดี่ยวได้ตลอดคืน", $descFont, $descBrush, [float]$infoX, [float]($infoY + 230))
$descFont.Dispose()
$descBrush.Dispose()

# Very bottom copyright / RMUTK signature
$footFont = New-Object System.Drawing.Font($thaiFontFamily, 12, [System.Drawing.FontStyle]::Regular)
$footBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 148, 163, 184))
$g.DrawString("มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ • Rajamangala University of Technology Krungthep", $footFont, $footBrush, [float]$ctaX, [float]($ctaY + $ctaH + 20))
$footFont.Dispose()
$footBrush.Dispose()


# 8. Save High-Quality Poster PNG
$posterPath = "D:\rmutk_loykrathong\public\rmutk-loykrathong-poster.png"
$bmp.Save($posterPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Output "Successfully generated $posterPath ($width x $height)"
