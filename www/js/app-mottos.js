// Adapted from http://extras.denverpost.com/app/bill-tracker/bills/ , adapted from http://www.soliantconsulting.com/blog/2013/02/title-generator-using-markov-chains
var markov = {
    titles: ["there is no darkness without light","dragons on the mountain","steel over ice","the night lays claims","no hope on the mountain","winter's child slays","the last word is dalgroth","for every sigil comes an oath","walk with me through the valley of shadows","give not, yield not","without sunlight no birds shall fly","a warrior's heart lies not in the dirt","stack that gold high","wither the trees of hate","the past lays its swords on the present","the sea calls for noone","winds blow through death's door","muster strength in the morning","ice before fire","crush your enemies, see them driven before you","death to the world","a sword's thrust is but half the story","life for valeria","why are they trying to kill us","brittle bones make not of kings","a queen's word makes a king's oath","ships sail high, shovels bury the dead","fire and wind come from the sky","two stand against many","flesh is stronger than steel","enough talk","look into the eyes of the dragon and despair","worry lies in the hearts of the weak","a castle will not shield against death's wail","lament the lost","ghouls lay claim on the bones of the dead","the king and the land are one","I consign you to oblivion","a dream to some, a nightmare to more","eat and dine and drink and die","by sea and by land","we see noone","please don't think ill of us","citius altius fortius","someone in all, is nothing in one","authority, not truth, makes law","do what you do","I love the name of honor more than I fear death","retribution for those fallen","whisper through the halls of pain","sheath the sword of jealousy","make not o'er the bridge of despair","a warrior's bane, a witch's benefit","say much in few words","neither reckless nor timid","we are the chosen","forward from beneath","woe to the conquered","change or turn around","live pondering death","the debt will be paid","laziness is a wicked temptress","even one hair has a shadow","hunger sweetens the beans","shadow passes, light remains","carpe noctem","here we are","an empire within an empire","vox nihili","remember to live","by skill and valor","for honor","deeds, not words","the void awaits","the breath of night","sleep, eat, fight","bereft on the peaks of valor","divine are the angels of light","the brave fear not the dead","bringer of valor sways with the wary","slay the solemn ghost","wield and work","this is an outrage"],
    terminals: {},
    startwords: [],
    wordstats: {},
    init: function() {
        var len = this.titles.length;
        for (var i = 0; i < len; i++)
        {
            var words = this.titles[i].split(' ');
            this.terminals[words[words.length-1]] = true;
            this.startwords.push(words[0]);
            var wordlen = words.length;
            for (var j = 0; j < wordlen - 1; j++)
            {
                if (this.wordstats.hasOwnProperty(words[j])) {
                    this.wordstats[words[j]].push(words[j+1]);
                } else {
                    this.wordstats[words[j]] = [words[j+1]];
                }
            }
        }
    },
    choice: function (a) {
        var i = Math.floor(a.length * Math.random());
        return a[i];
    },
    make_title: function (min, max) {
        var word = this.choice(this.startwords);
        var title = [word];
        while (this.wordstats.hasOwnProperty(word)) {
            var next_words = this.wordstats[word];
            word = this.choice(next_words);
            title.push(word);
            if (title.length > min && this.terminals.hasOwnProperty(word)) break;
        }

        // Sometimes the last word is "of." That definitely makes no sense.
        if ( title[title.length - 1] === 'of' ) title.splice(-1, 1);

        if (title.length < min) return this.make_title(min, max);
        if (title.length > max) return this.make_title(min, max);
        return title.join(' ');
    },
    length: 1,
    load_title: function(id) {
        var floor = 4;
        var min = floor + Math.floor(2 * Math.random());
        var max = min + Math.floor(8 * Math.random());
        var title = this.make_title(min, max);
        document.getElementById('motto').innerHTML = title;
    },
}
markov.init();

// Instead of markov-chaining a title together, just pick a random one from the list.
var full = {
    titles: markov.titles.slice(0),
    init: function () {},
    pick: function() {
        var i = Math.floor(this.titles.length * Math.random());
        this.load_title(this.titles[i]);
        // Make sure the same title isn't loaded more than once
        this.titles.splice(i, 1);
        return this.titles[i];
    },
    load_title: function(title) {
        document.getElementById('motto').innerHTML = title;
    }
};

function convert_to_id(text) {
    return markov.titles.indexOf(text);
}
function convert_to_slug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}

function save_motto() {
    $('#url').removeClass('hide');
    $('#card').addClass('black');
    save_image();
}

function save_image()
{
    html2canvas($('#card'), {
        allowTaint: true,
        onrendered: function(canvas) {

            document.body.appendChild(canvas);
            window.oCanvas = document.getElementsByTagName("canvas");
            window.oCanvas = window.oCanvas[0];
            var strDataURI = window.oCanvas.toDataURL();

            var filename = convert_to_slug($('#motto').text());

            var a = $("<a>").attr("href", strDataURI).attr("download", "motto-" + filename + ".png").appendTo("body");
            a[0].click();
            a.remove();

            $('#download-'+filename).attr('href', strDataURI).attr('target', '_blank');
            $('#download-'+filename).trigger('click');
            window.location.reload(true);

            $('#url').addClass('hide');
            $('#card').removeClass('black');
        }
    });
}

function share_it() {
    // PERMALINK
    // Edit the URL to make the image permalinkable
    var motto_words = $('#motto').text();
    var shield_id = $('#motto-image').attr('src').replace('img/shield-','').replace('.png','');
    var slug = convert_to_id(motto_words);
    document.location.hash = '#' + slug + '_' + shield_id;
    var url = document.location.href.replace('#','?motto=');
    var tweet_text = "My #GoT house motto: " + motto_words;
    var markup = "<h3>Share your house words</h3>\n\
<a class=\"twitter-share\" href='http://twitter.com/share?url=" + url + "&text=" + tweet_text + "&via=nydni&related=nydailynews' target='_blank'>\n\
<button class='share social_icon_box twitter_button'>Share On Twitter</button></a>&nbsp;\n\
<a class=\"fb-share\" href='http://www.facebook.com/sharer.php?u=" + url + "' target='_blank'>\n\
<button class='share social_icon_box facebook_button'>Share On Facebook</button></a>\n\
</div>";
    $('#motto-share').html(markup);
}

function load_motto(hash) {
    // PERMALINK
    // When a permalink is loaded, return the item
    window.history.replaceState('', '', document.location.origin + document.location.pathname);
    $( document ).ready(function() {
        var pieces = hash.substr(1).split('_');
        var motto_id = +pieces[0];
        var shield_id = +pieces[1];

        $('#motto-image').removeClass('initial');
        $('#motto-image').attr('src','img/shield-'+ shield_id + '.png');

        var new_name = markov.titles[motto_id];
        console.log("HI", pieces, motto_id, shield_id, new_name);
        $('#motto-image').attr('alt', new_name);
        $('#motto').text(new_name);
        console.log('aaaa');
    });
}

var count = 0;
var ad = 1;
var ad_id = 'div-gpt-ad-1423507761396-';
function generate_motto() {
    // Handle the house-name customization
    var house = '';
    var house_input = document.getElementById('house').value.trim();
    if ( house_input !== '' ) {
        house = 'House ' + house_input;
        document.getElementById('house-name').textContent = house;
        $('#house-name').removeClass('hide');
    }
    else {
        $('#house-name').addClass('hide');
    }

    if ( count == 0 ) {
        $('#motto-image').removeClass('initial');
        //document.getElementById("save-motto").disabled = false;
        //document.getElementById("share-motto").disabled = false;
    } 
    count += 1;

    // AD REFRESH AND SUCH
    if ( count % 10 == 0 ) {
        $('#motto-image, #house-name, #motto').addClass('hide');
        $('#ad' + ad).removeClass('hide');
        $('#motto').text('ad');
        return true;
    }
    if ( count > 1 && count % 10 == 1 ) {
        $('#ad' + ad).addClass('hide');
        $('#motto-image, #house-name, #motto').removeClass('hide');
        ad += 1;
        if ( ad > 3 ) ad = 1;
        // AD REFRESH
        if ( count % 30 == 1 ) googletag.pubads().refresh();
    }
    if ( count % 5 == 0 ) {
        // Add a PV every five mottos
        PARSELY.beacon.trackPageView({
            url: document.location.href,
            urlref: document.location.href,
            js: 1
        });
    }

    var shield_id = Math.floor(Math.random() * 26);
    var motto_img = 'img/shield-' + shield_id + '.png';
    var new_name = full.pick();
    var motto_id = convert_to_id(new_name);
    $('#motto-image').attr('src', motto_img);
    $('#motto-image').attr('alt', new_name);
    window.history.replaceState('', '', document.location.origin + document.location.pathname + '#' + motto_id + '_' + shield_id);
    $('#motto').text(new_name);
}

hsh = document.location.hash.substr(1);
$('#motto-image, #motto').click(function() { generate_motto(); });

// In case we're back here via save button
if ( document.referrer == document.location.href ) $('#generate-name').trigger('click');

// PERMALINK
if ( document.location.hash !== '' ) load_motto(document.location.hash);
if ( document.location.search !== '' ) load_motto(document.location.search.replace('motto=',''));

// PRELOAD IMAGES
for ( var i = 0; i < 26; i ++ ) {
    $('<img/>')[0].src = 'img/shield-' + i + '.png';
}
