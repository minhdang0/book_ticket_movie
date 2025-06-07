
export const checkPaid = async () => {
    const res = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiSZZ7d3LquIUbeS-tsiHg7qx9QoNE6L8HUbMord-YEAmTtHdXvCYuT1snyqJQZsQMqLokjx4J3VMWHhGBuqLikYBLYbRNnEveA8N6s3mNhik8v_lUtU0iKBIwCGXf9dUHE4gkw3ToOpoeSY1xlN1ks_zAnJWb1auNbqbzjH9aecOg2qDAJD1QZ26wwCzEGG1rO6b10cgIJ9DZYyVvuvorCMMC1rmH8-r7VxQqnlhY7l23J0J7PctBfOM7c0FeO7UKvX15V8unPPa48KP4jRAC4kts-Eg&lib=MnOBMu8znF_L011cuzEXR4l_kXSEa8zW4');
    const result = await res.json();
    return result.data;
}