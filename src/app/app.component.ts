import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import * as _ from 'lodash';
import * as backbone from 'backbone';
import * as joint from 'jointjs';
import * as Diagram from 'diagram-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

   public graph = new joint.dia.Graph;

   ngOnInit() {

    const graph = this.graph;
    const paper = new joint.dia.Paper({ el: $('#paper-html-elements'), width: 1000, height: 800, gridSize: 1, model: graph });

    joint.shapes['html'] = {};
    joint.shapes['html'].Element = joint.shapes.basic.Rect.extend({
      defaults: joint.util.deepSupplement({
        type: 'html.Element',
        attrs: {
          rect: { stroke: 'none', 'fill-opacity': 0 }
        }
      }, joint.shapes.basic.Rect.prototype.defaults)
    });

    joint.shapes['html'].ElementView = joint.dia.ElementView.extend({

      template: [
        '<div class="html-element">',
        '<button class="delete">x</button>',
        '<label></label>',
        '<span></span>', '<br/>',
        '<table class="msg-com">',
        '<tr><td>Text</td></tr>',
        '<tr><td>Image</td></tr>',
        '</table>',
        '<button class="addComBox">++++</button>',
        '<g class="inPorts"/><g class="outPorts"/></g>',
        '</div>'
      ].join(''),

      initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('input,select').on('mousedown click', function(evt) {3
          evt.stopPropagation();
        });
        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('input').on('change', _.bind(function(evt) {
          this.model.set('input', $(evt.target).val());
        }, this));
        this.$box.find('select').on('change', _.bind(function(evt) {
          this.model.set('select', $(evt.target).val());
        }, this));
        this.$box.find('select').val(this.model.get('select'));
        this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
        this.$box.find('.addComBox').on('click', _.bind(function(evt){
          // $('.msg-com').append('<tr><td>추가되었다.</td></tr>');
          this.$box.find('.msg-com').append('<tr><td>여기만.</td></tr>');
          console.log(this.model.get('size'));
          const size = this.model.get('size');
          size.height = size.height + 25;
          this.model.set(size);
        }, this));

        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();
      },
      render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        this.updateBox();
        return this;
      },
      updateBox: function() {
        // Set the position and dimension of the box so that it covers the JointJS element.
        const bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        this.$box.find('label').text(this.model.get('label'));
        this.$box.find('span').text(this.model.get('select'));
        this.$box.css({
          width: bbox.width,
          height: bbox.height,
          left: bbox.x,
          top: bbox.y,
          transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
        });
      },
      removeBox: function(evt) {
        this.$box.remove();
      },
      addComBoxOne: function(){
        alert('확인한다.');
      }
    });

    const el1 = new joint.shapes['html'].Element({
      position: { x: 80, y: 80 },
      size: { width: 170, height: 100 },
      label: 'FaceBook',
      select: 'one',
      inPorts: ['in']
    });
    const el2 = new joint.shapes['html'].Element({
      position: { x: 370, y: 160 },
      size: { width: 170, height: 100 },
      label: 'Me too',
      select: 'two'
    });
    const l = new joint.dia.Link({
      source: { id: el1.id },
      target: { id: el2.id },
      attrs: { '.connection': { 'stroke-width': 5, stroke: '#34495E' } }
    });

    this.graph.addCells([el1, el2, l]);


  }

  public addBox(): void {

    const e3 = new joint.shapes['html'].Element({
      position: { x: 80, y: 80 },
      size: { width: 170, height: 100 },
      label: 'AddBox',
      select: 'one',
      inPorts: ['in1', 'in2'],
      outPorts: ['out'],
      ports: {
        groups: {
          'in': {
            attrs: {
              '.port-body': {
                fill: '#16A085'
              }
            }
          },
          'out': {
            attrs: {
              '.port-body': {
                fill: '#E74C3C'
              }
            }
          }
        }
      }
    });
    this.graph.addCells([e3]);
  }

  public getInfo(): void {
     console.log(this.graph.getSources());
  }

}
