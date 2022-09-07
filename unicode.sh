#!/bin/sh

# https://www.unicode.org/Public/UCD/latest/ucd/extracted/DerivedGeneralCategory.txt

collect() {
  echo -n "$1 = [" >> unicode.txt
    grep "; $1" DerivedGeneralCategory.txt |        # Filter characters
    cut -f1 -d " " |                                # Extract code points
    grep -v '[0-9a-fA-F]\{5\}' |                    # Exclude non-BMP characters
    sed -e 's/\.\./-/' |                            # Adjust formatting
    sed -e 's/\([0-9a-fA-F]\{4\}\)/\\u\1/g' |       # Adjust formatting
    tr -d '\n' |                                    # Join lines
    tee -a unicode.txt
  echo -n "]\n\n" >> unicode.txt
}

rm -f unicode.txt

collect Ll
collect Lm
collect Lo
collect Lt
collect Lu
collect Zs
collect Pc
collect Mn
collect Mc
collect Nd
collect Nl
