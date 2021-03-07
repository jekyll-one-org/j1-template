== Create links on Windows

See: https://docs.microsoft.com/de-de/windows-server/administration/windows-commands/mklink

mklink [[/d] | [/h] | [/j]] <Link> <Target>
Parameter
Parameter	Beschreibung
/d	Erstellt einen symbolischen Verzeichnis Link. Standardmäßig erstellt mklink einen symbolischen Datei Link.
/h	Erstellt einen festen Link anstelle eines symbolischen Links.
/j	Erstellt eine Verzeichnis Verknüpfung.
<Link >	Gibt den Namen der symbolischen Verknüpfung an, die erstellt wird.
<Target >	Gibt den Pfad (relative oder absolute) an, auf den die neue symbolische Verknüpfung verweist.
/?	Zeigt die Hilfe an der Eingabeaufforderung an.


=== Create a Junction

Erstellt eine Verzeichnis Verknüpfung.

cd C:\MultiPlatform

# create a "junction"

mklink /j .\ruby .\ruby-2.4.5p335

mklink /j .\python .\python-2.7.18
mklink /j .\python .\python-3.8.2

mklink /j .\starter .\starter-2021.1.0

mklink /j .\tocbot .\tocbot-4.11.2
